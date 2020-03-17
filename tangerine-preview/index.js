#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const http = require('http')
const express = require('express')
const syncFolders = require("sync-directory")

const TANGERINE_CLIENT_DIR = `${__dirname}${path.normalize('/app')}`
const ASSETS_DIR = `${TANGERINE_CLIENT_DIR}${path.normalize('/assets/')}`

const app = express()
const port = 3000

app.use(express.static(TANGERINE_CLIENT_DIR))

// Listen

async function go() {
  try {
    const raw = fs.readFileSync(`${process.cwd()}/app-config.json`)
    const appConfig = JSON.parse(raw)
    await fs.remove(ASSETS_DIR)
    syncFolders(process.cwd(), ASSETS_DIR, {watch: true})
    app.listen(port, () => console.log(`Tangerine app is running. Open http://localhost:${port}`))
  } catch (e) {
    console.log('Is this directory Tangerine content? If it is, there may be something wrong with the app-config.json.')
  }
}
go()
