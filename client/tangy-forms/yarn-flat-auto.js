#!/usr/bin/env node
// # run this before using: yarn add --dev node-pty semver

const os = require("os")
const pty = require("node-pty")

const semver = require("semver")

function semverComparator(a, b) {
  if (semver.lt(a, b)) {
    return -1
  } else if (semver.gt(a, b)) {
    return 1
  } else {
    return 0
  }
}

const proc = pty.spawn("yarn", ["install", "--flat"], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  env: process.env,
})

let buff = ""

proc.on("data", function(data) {
  console.log("yarny: " + data)
  buff += data.toString()
  if (buff.match(/Answer\?:/g)) {
    const packageName = buff.match(/suitable version for "(\S+)"/)[1]
    const versions = buff
      .split(/\r?\n/g)
      .filter(line => line.match("which resolved to"))
      .map(line => line.match(/"(\S+)"$/)[1])
    const sorted = versions.slice(0).sort(semverComparator)
    const highestVersion = sorted[sorted.length - 1]
    const choice = versions.indexOf(highestVersion) + 1
    console.log(`Choosing ${packageName}@${highestVersion}`)
    proc.write(choice.toString() + "\r\n")
    buff = ""
  }
})

proc.on("error", err => {
  console.error(err)
})