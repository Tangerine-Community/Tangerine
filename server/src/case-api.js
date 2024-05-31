const DB = require('./db.js')
const log = require('tangy-log').log
const path = require('path')
const fs = require('fs')
const { v4: uuidV4 } = require('uuid')

const {Case: Case, CaseEvent: CaseEvent, EventForm: EventForm } = require('./classes/case.class.js')

/* Return the contents of the case-definitions.json file or a sepcified */
getCaseDefinitions = async (req, res) => {
  const groupDir = `/tangerine/client/content/groups/${req.params.groupId}`
  const caseType = 'case-definitions.json'
  try {
    const fileName = caseType.endsWith('.json') ? caseType : `${caseType}.json`
    const filePath = path.join(groupDir, fileName)
    if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, "utf8")
        return res.send(fileContents)
    } else {
        return res.status(500).send('Case definitions file not found')
    }
  } catch (err) {
    log.error(`Error reading case definitions: ${err}`)
    return res.status(500).send(err)
  }
}

getCaseDefinition = async (req, res) => {
  const groupId = req.params.groupId
  const caseDefinitionId = req.params.caseDefinitionId
  try {
        let caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
        return res.send(caseDefinition)
  } catch (err) {
    log.error(`Error reading case definition file from ${caseType}`)
    return res.status(500).send(err)
  }
}

_getCaseDefinition = (groupId, caseDefinitionId) => {
  let caseDefinition = {};

  const groupDir = `/tangerine/client/content/groups/${groupId}`
  const fileName = caseDefinitionId.endsWith('.json') ? caseDefinitionId : `${caseDefinitionId}.json`
  const filePath = path.join(groupDir, fileName)
  if (fs.existsSync(filePath)) {
      const caseDefinitionContent = fs.readFileSync(filePath, "utf8")
      caseDefinition = JSON.parse(caseDefinitionContent)
  }

  return caseDefinition;
}

createCase = async (req, res) => {
  let groupId = req.params.groupId
  let caseDefinitionId = req.params.caseDefinitionId

  try {
    const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
    let caseDoc = new Case(groupId, caseDefinitionId, caseDefinition)

    if (Object.keys(req.body).length > 0) {
      const inputs = req.body
      caseDoc.addInputs(inputs)
    }

    const db = new DB(groupId)
    await db.put(caseDoc);
    res.send(caseDoc._id);
  } catch (err) {
    log.error(`Error creating case: ${err}`)
    res.status(500).send(err)
  }
}

createCaseEvent = async (req, res) => {
  let groupId = req.params.groupId
  let caseId = req.params.caseId
  let caseDefinitionId = req.params.caseDefinitionId
  let caseEventDefinitionId = req.params.caseEventDefinitionId
  
  const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
  let caseEventDefinition = caseDefinition.eventDefinitions.find((e) => e.id === caseEventDefinitionId)
  let caseEvent = new CaseEvent(groupId, caseEventDefinition)

  let caseDoc;
  try {
    const db = new DB(groupId)
    caseDoc = await db.get(caseId);
    caseDoc.events.push(caseEvent);
    await db.put(caseDoc);
    res.send(caseEvent._id);
  } catch (err) {
    res.status(500).send
  }
}

createEventForm = async (req, res) => {
  let groupId = req.params.groupId
  let caseId = req.params.caseId
  let caseEventId = req.params.caseEventId
  let eventFormDefinitionId = req.params.eventFormDefinitionId

  const caseDefinition = _getCaseDefinition(groupId, caseDefinitionId)
  let eventFormDefinition;
  for (const eventDefinition of caseDefinition.eventDefinitions) {
      eventFormDefinition = eventDefinition.eventFormDefinitions.find((f) => f.id === eventFormDefinitionId)
      if (eventFormDefinition) break;
  }
  
  let eventForm = new EventForm(groupId, caseId, caseEventId, eventFormDefinition)

  try {
    const db = new DB(groupId)
    caseDoc = await db.get(caseId);
    let caseEvent = caseDoc.events.find((e) => e.id === caseEventId);
    caseEvent.eventForms.push(eventForm);
    await db.put(caseDoc);
    res.send(eventForm._id);
  } catch (err) {
    res.status(500).send
  }
}

createParticipant = async (req, res) => {
  const groupId = req.params.groupId
  const caseId = req.params.caseId
  const caseRoleId = req.params.caseRoleId

  const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
  const caseRole = caseDefinition.caseRoles.find((r) => r.id === caseRoleId)

  let participant = new Participant(groupId, caseId, caseRole)

  try {
    const db = new DB(groupId)
    const caseDoc = await db.get(caseId);
    caseDoc.participant.push(participant);
    await db.put(caseDoc);
    res.send(eventForm._id);
  } catch (err) {
    res.status(500).send
  }
}

getEventFormData = async (req, res) => {
  const groupDb = new DB(req.params.groupId)
  let data = {}
  try {
    let options = { key: req.params.eventFormId, include_docs: true }
    const results = await groupDb.query('eventForms/eventForms', options);
    if (results.rows.length > 0) {
      const doc = results.rows[0].doc
      for (let event of doc.events) {
        let eventForm = event.eventForms.find((f) => f.id === req.params.eventFormId);
        if (eventForm) {
          data = eventForm
          break;
        }
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(data)
}

getCaseEventFormSurveyLinks = async (req, res) => {
  const caseId = req.params.caseId
  const groupDb = new DB(req.params.groupId)

  let data = []
  try {
    const results = await groupDb.get(caseId)
    if (results.rows.length > 0) {
      const caseDoc = results.rows[0].doc
      const caseDefinition = _getCaseDefinition(groupId, caseDoc.caseDefinitionId)
      for (let event of doc.events) {
        let eventForm = event.eventForms.find((f) => f.id === req.params.eventFormId);
        if (eventForm) {
          let formId;
          for (let eventDefinition of caseDefinition.eventDefinitions) {
            formId = eventDefinition.find((e) => e.id === eventForm.eventFormDefinitionId).formId
            if (formId) break;
          }
        }
        const url = `http://localhost/releases/prod/online-survey-apps/group-344fabfe-f892-4a6d-a1da-58616949982f/${formId}/#/caseFormResponse/${caseId}/${eventForm.id}`
        data.push(url)
        break;
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(data)
}

module.exports = {
  getCaseDefinitions,
  getCaseDefinition,
  createCase,
  createCaseEvent,
  createEventForm,
  getEventFormData
}