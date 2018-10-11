const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const groupsList = require('./groups-list')
const { log } = require('tangy-log')
const { get, put } = require('axios')
const DB = require('./db')

const PAID_BATCH_SIZE=5

const allowance = process.env.T_PAID_ALLOWANCE ? process.env.T_PAID_ALLOWANCE : 'unlimited'
const defaultState = {
  batchMarkedPaid: 0,
  totalMarkedPaid: 0,
  groups: []
}

async function runPaidWorker() {
  if (process.env.T_PAID_MODE === 'group') {
    return await runPaidGroupWorker()
  } else if (process.env.T_PAID_MODE === 'site') {
    return await runPaidSiteWorker()
  }
}

async function runPaidGroupWorker() {

}

async function runPaidSiteWorker() {
  let state = JSON.parse(await readFile('/paid-worker-state.json', 'utf-8'))
  // Have we exceeded our allowance? Bail.
  if (state.totalMarkedPaid >= allowance) {
    state = Object.assign({}, state, {batchMarkedPaid: 0})
  } else {
    state = await runBatch(state)
  }
  await writeFile('/paid-worker-state.json', JSON.stringify(state), 'utf-8')
  return state
}

async function runBatch(currentState) {
  let state = Object.assign({}, defaultState, currentState)
  const groupNames = await groupsList()
  // Ensure all groups are accounted for in state.groups array.
  groupNames.forEach(groupName => {
    if (state.groups.findIndex(groupEntry => groupEntry.name === groupName) === -1) {
      state.groups.push({name: groupName, totalMarkedPaid: 0, batchMarkedPaid: 0})
    }
  })
  // Group entries in state.groups that are not in the current group list should be marked as deleted so they are not processed.
  state.groups = state.groups.map(groupEntry => {
    if (groupNames.findIndex(groupName => groupEntry.name === groupName) === -1) {
      return Object.assign({}, groupEntry, {deleted: true})
    } else {
      return Object.assign({}, groupEntry, {deleted: false})
    }
  })
  // Process state.groups.
  let processedGroups = []
  let totalMarkedPaid = state.groups.reduce((totalMarkedPaid, groupEntry) => totalMarkedPaid + groupEntry.totalMarkedPaid, 0)
  for (let groupEntry of state.groups) {
    if (totalMarkedPaid < allowance) {
      const processedGroup = await processGroup(groupEntry)
      totalMarkedPaid = processedGroup.batchMarkedPaid + totalMarkedPaid
      processedGroups.push(processedGroup)
    }
  }
  const batchMarkedPaid = processedGroups.reduce((batchMarkedPaid, groupEntry) => batchMarkedPaid + groupEntry.batchMarkedPaid, 0)
  const groups = state.groups.map(groupEntry => {
    const processedGroup = processedGroups.find(processedGroup => processedGroup.name === groupEntry.name)
    if (processedGroup) {
      return Object.assign({}, groupEntry, processedGroup)
    } else {
      return groupEntry
    }
  }) 
  return Object.assign({}, state, {batchMarkedPaid, totalMarkedPaid, groups})
}

async function processGroup(groupEntry) {
  let batchMarkedPaid = 0
  let totalMarkedPaid = groupEntry.totalMarkedPaid
  let db = new DB(groupEntry.name)
  // Test.
  const response = await db.query('unpaid', {limit: PAID_BATCH_SIZE, include_docs:true})
  const docs = response.rows.map(row => row.doc)
  for (let doc of docs) {
    await db.put(Object.assign({}, doc, {paid: true}))
  }
  batchMarkedPaid = docs.length
  totalMarkedPaid = totalMarkedPaid + batchMarkedPaid
  return Object.assign({}, groupEntry, {batchMarkedPaid, totalMarkedPaid})

}

module.exports = runPaidWorker }