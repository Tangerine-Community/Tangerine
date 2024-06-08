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
    this.data = []

    for (const eventFormDefinition of eventDefinition.eventFormDefinitions) {
      if (eventFormDefinition.required) {
        this.eventForms.push(new EventForm(caseId, this._id, eventFormDefinition))
      }
    }
  }

  addData(data) {
    if (Array.isArray(data)) {
      this.data.push(...data)
    } else {
      this.data.push(data)
    }
  }
}

class EventForm {
  constructor(caseId, caseEventId, eventFormDefinition) {
    this.id = uuidV4()
    this.caseId = caseId
    this.caseEventId = caseEventId
    this.eventFormDefinitionId = eventFormDefinition.id
    this.required = eventFormDefinition.required
    this.participantId = ''
    this.complete = false
    this.inactive = false
    this.data = [];
  }

  addData(data) {
    if (Array.isArray(data)) {
      this.data.push(...data)
    } else {
      this.data.push(data)
    }
  }
}

class Participant {
  constructor(caseRole) {
    this.id = uuidV4()
    this.caseRoleId = caseRole.id
    this.name = caseRole.label
    this.inactive = false;
    this.data = [];
  }

  addData(data) {
    if (Array.isArray(data)) {
      this.data.push(...data)
    } else {
      this.data.push(data)
    }
  }
}

exports.Case = Case
exports.CaseEvent = CaseEvent
exports.EventForm = EventForm
exports.Participant = Participant