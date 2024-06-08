const uuidV4 = require('uuid').v4

class Case {
  constructor(groupId, caseDefinitionId, caseDefinition) {
    this._id = uuidV4();
    this.type = 'case'
    this.collection = 'TangyFormResponse'
    this.caseDefinitionId = caseDefinitionId
    this.archived = false
    this.groupId = groupId
    this.location = {}
    this.form = { id: caseDefinition.formId }
    this.items = [{ inputs: [] }],
    this.participants = []
    this.disabledEventDefinitionIds = []
    this.notifications = []
    this.events = []

    for (let eventDefinition of caseDefinition.eventDefinitions) {
      if (eventDefinition.required) {
        this.events.push(new CaseEvent(this._id, eventDefinition))
      }
    }
  }

  addInputs(inputs) {
    // transform key, value pairs to 'name' : key, 'value': value pairs
    for (let key in inputs) {
      const input = {
        name: key,
        value: inputs[key]
      }
      this.items[0].inputs.push(input)
    }
  }
}

class CaseEvent {
  constructor(caseId, eventDefinition) {
    this.id = uuidV4();
    this.caseId = caseId
    this.name = ''
    this.caseEventDefinitionId = eventDefinition.id
    this.complete = false
    this.inactive = false
    this.eventForms = []

    for (const eventForm of eventDefinition.eventFormDefinitions) {
      if (eventForm.required) {
        this.eventForms.push(new EventForm(caseId, this._id, eventForm))
      }
    }
  }

  addData(data) {
    this.data = data
  }
}

class EventForm {
  constructor(caseId, caseEventId, eventFormDefinition = null) {
    this.id = uuidV4()
    this.caseId = caseId
    this.caseEventId = caseEventId
    this.eventFormDefinitionId = eventFormDefinition.id
    this.required = eventFormDefinition.required
    this.participantId = ''
    this.complete = false
    this.inactive = false
  }

  addData(data) {
    this.data = data
  }
}

class Participant {
  constructor(participantDefinition) {
    this.id = uuidV4()
    this.caseRoleId = participantDefinition.id
    this.name = ''
    this.inactive = false;
  }

  addData(data) {
    this.data = data
  }
}

exports.Case = Case
exports.CaseEvent = CaseEvent
exports.EventForm = EventForm
exports.Participant = Participant