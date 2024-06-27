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
    this.name = eventDefinition.name || ''
    this.caseEventDefinitionId = eventDefinition.id
    this.complete = false
    this.inactive = false
    this.eventForms = []
    this.data = []

    for (const eventFormDefinition of eventDefinition.eventFormDefinitions) {
      if (eventFormDefinition.required && eventFormDefinition.forCaseRole == '') {
        this.eventForms.push(new EventForm(caseId, this.id, eventFormDefinition))
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
  constructor(caseId, caseEventId, eventFormDefinition, participantId) {
    this.id = uuidV4()
    this.caseId = caseId
    this.name = eventFormDefinition.name || ''
    this.caseEventId = caseEventId
    this.eventFormDefinitionId = eventFormDefinition.id
    this.required = eventFormDefinition.required
    this.participantId = participantId || ''
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
  constructor(caseRole, caseInstance='', caseDefinition='') {
    this.id = uuidV4()
    this.caseRoleId = caseRole.id
    this.name = caseRole.label
    this.inactive = false;
    this.data = [];

    if (caseInstance) {
      for (let event of caseInstance.events) {
        const eventDefinition = caseDefinition.eventDefinitions.find((e) => e.id === event.caseEventDefinitionId)
        if (eventDefinition) {
          const eventFormsForRole = eventDefinition.eventFormDefinitions.filter((f) => f.required && f.forCaseRole === caseRole.id)
          for (const eventFormDefinition of eventFormsForRole) {
            event.eventForms.push(new EventForm(caseInstance._id, event.id, eventFormDefinition, this.id))
          }
        }
      }
      caseInstance.participants.push(this)
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

exports.Case = Case
exports.CaseEvent = CaseEvent
exports.EventForm = EventForm
exports.Participant = Participant