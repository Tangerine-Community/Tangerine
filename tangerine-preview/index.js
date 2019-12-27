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
  await fs.remove(ASSETS_DIR)
  syncFolders(process.cwd(), ASSETS_DIR, {watch: true})
  app.listen(port, () => console.log(`Tangerine app is running. Open http://localhost:${port}`))
}
go()
