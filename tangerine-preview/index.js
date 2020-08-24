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
const url = `http://localhost:${port}`

app.use(express.static(TANGERINE_CLIENT_DIR))

// Listen

async function go() {
  const appConfigPath = `${process.cwd()}/app-config.json`
  const appConfigExamplePath = `${process.cwd()}/app-config.json_example`
  const appConfigDefaultsPath = `${process.cwd()}/app-config.defaults.json`
  // Set up app-config.json using app-config.json_example, unless app-config.json is already set up.
  if (!fs.existsSync(appConfigPath) && (fs.existsSync(appConfigExamplePath) || fs.existsSync(appConfigDefaultsPath)) {
    if (fs.existsSync(appConfigDefaultsPath)) {
      fs.copyFileSync(appConfigDefaultsPath, appConfigPath)
    } else {
      fs.copyFileSync(appConfigExamplePath, appConfigPath)
    }
    appConfig = await fs.readJSON(appConfigPath)
    appConfig.serverUrl = url
    await fs.writeJson(appConfigPath, appConfig)
  }
  // If neither an app-config.json or app-config.json_example file exists, we're likely not in a content set directory.
  if (!fs.existsSync(appConfigPath) && !fs.existsSync(appConfigExamplePath)) {
    console.log('')
    console.log('This does not appear to be a Tangerine content set. No app-config.json, app-config.defaults.json, or app-config.json_example found. See the documentation on content sets at https://docs.tangerinecentral.org/.')
    console.log('')
  }
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
