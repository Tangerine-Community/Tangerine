const DB = require('./db.js')
const log = require('tangy-log').log
const path = require('path')
const fs = require('fs')

const {
  Case: Case,
  CaseEvent: CaseEvent,
  EventForm: EventForm,
  Participant: Participant
} = require('./classes/case.class.js')

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

  // check that req.body is json, if not, use JSON.parse
  let inputs;
  try {
    if (typeof req.body == 'object' && Object.keys(req.body).length > 0) {
      inputs = req.body
    }
  } catch (err) {
    log.error(`Error parsing case inputs from request body: ${err}`)
  }

  try {
    const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
    let caseDoc = new Case(groupId, caseDefinitionId, caseDefinition)

    if (inputs) {
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

readCase = async (req, res) => {
  const groupDb = new DB(req.params.groupId)
  let data = {}
  try {
    data = await groupDb.get(caseId);
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(data)
}

createCaseEvent = async (req, res) => {
  let groupId = req.params.groupId
  let caseId = req.params.caseId
  let caseDefinitionId = req.params.caseDefinitionId
  let caseEventDefinitionId = req.params.caseEventDefinitionId
  
  const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
  let caseEventDefinition = caseDefinition.eventDefinitions.find((e) => e.id === caseEventDefinitionId)
  let caseEvent = new CaseEvent(caseId, caseEventDefinition)

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
  
  let eventForm = new EventForm(caseId, caseEventId, eventFormDefinition)

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
  try {
    const groupId = req.params.groupId
    const caseId = req.params.caseId
    const caseDefinitionId = req.params.caseDefinitionId
    const caseRoleId = req.params.caseRoleId

    const caseDefinition =  _getCaseDefinition(groupId, caseDefinitionId)
    const caseRole = caseDefinition.caseRoles.find((r) => r.id === caseRoleId)

    let participant = new Participant(caseRole)

    const db = new DB(groupId)
    const caseDoc = await db.get(caseId);
    caseDoc.participants.push(participant);
    await db.put(caseDoc);
    res.send(participant.id);
  } catch (err) {
    res.status(500).send
  }
}

getCaseEventFormSurveyLinks = async (req, res) => {
  let data = []
  try {
    const caseId = req.params.caseId
    const groupId = req.params.groupId

    const GROUPS_DB = new DB('groups');
    const groupData = await GROUPS_DB.get(groupId);
    const onlineSurveys = groupData.onlineSurveys ? groupData.onlineSurveys : [];

    const groupDb = new DB(req.params.groupId)
    const caseDoc = await groupDb.get(caseId)
    const caseDefinition = _getCaseDefinition(groupId, caseDoc.caseDefinitionId)

    for (let event of caseDoc.events) {
      for (let eventForm of event.eventForms.filter((f) => !f.formResponseId)) {
        const eventDefinition = caseDefinition.eventDefinitions.find((e) => e.id === event.caseEventDefinitionId)
        if (eventDefinition) {
          const eventFormDefinition = eventDefinition.eventFormDefinitions.find((e) => e.id === eventForm.eventFormDefinitionId)
          if (eventFormDefinition && eventFormDefinition.formId) {
            const formId = eventFormDefinition.formId
            const survey = onlineSurveys.find((s) => s.formId === formId && s.published === true && s.locked === true)
            if (survey) {
              const origin = `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}`
              const pathname = `releases/prod/online-survey-apps/${groupId}/${formId}`
              const hash = `#/case/event/form/${caseId}/${event.id}/${eventForm.id}`
              const url = `${origin}/${pathname}/${hash}`
              data.push(
                {
                  "eventDefinitionId": event.caseEventDefinitionId,
                  "eventFormDefinitionId": eventForm.eventFormDefinitionId,
                  "formId": formId,
                  "url": url
                }
              )
            }
          }
        }
      }
    }
    res.send(data)
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = {
  getCaseDefinitions,
  getCaseDefinition,
  createCase,
  readCase,
  createCaseEvent,
  createEventForm,
  createParticipant,
  getCaseEventFormSurveyLinks
}