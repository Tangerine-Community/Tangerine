#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const axios = require('axios')
const DB = require('../db')
const fs = require('fs-extra')
const PouchDB = require('pouchdb')

async function go() {
  console.log("Generating an ssh key for the container to import private content sets.")
  try {
  await exec(`ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa-tmp -P "" -C "tangerine@${process.env.T_HOST_NAME}"`)
  await exec(`cat /root/.ssh/id_rsa-tmp > /root/.ssh/id_rsa`)
  await exec(`cat /root/.ssh/id_rsa-tmp.pub > /root/.ssh/id_rsa.pub`)
  await exec(`chmod 600 /root/.ssh/id_rsa`)
  } catch (e) { console.log(e) }
  process.exit()
}
go()

