import * as UUID from 'uuid/v4'
import { CaseEvent } from './case-event.class'
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';

class Case {
  _id:string
  _rev:string

  // @TODO We are unable to extend TangyFormResponseModel. This should be fixable.
  /*
   * START TangyFormResponse extend.
   */

  collection = 'TangyFormResponse'
  form = {}
  items = []
  focusIndex = 0
  nextFocusIndex = 1 
  previousFocusIndex =  -1
  startDatetime = (new Date()).toLocaleString()
  startUnixtime = Date.now()
  uploadDatetime = ''
  complete: boolean = false

  get inputs() {
    // Reduce to an array.
    return this.items.reduce((inputsArray, item) => {
      item.inputs.forEach(input => {
        if (input.tagName === 'TANGY-CARDS') {
          input.value.forEach(card => card.value.forEach(input => inputsArray.push(input)))
        } else {
          inputsArray.push(input)
        }
      })
      return inputsArray
    }, [])
  }

  get inputsByName() {
    // Reduce to an object keyed on input.name. If multiple inputs with the same name, put them in an array.
    return this.inputs.reduce((inputsObject, input) => {
      if (inputsObject.hasOwnProperty(input.name)) {
        if (Array.isArray(inputsObject[input.name])) {
          inputsObject[input.name] = inputsObject[input.name].push(input)
        } else {
          inputsObject[input.name] = [input, inputsObject[input.name]]
        }
      } else {
        inputsObject[input.name] = input
      }
      return inputsObject
    }, {})
  }

  /*
   * END TangyFormResponse extend.
   */

  caseDefinitionId:string
  label:string
  status:string
  openedDate:number
  variables:any = {}
  disabledEventDefinitionIds: Array<string> = []
  events: Array<CaseEvent> = []
  type:string = 'Case'
  caseFormResponse:TangyFormResponse
  constructor(data?:any) {
    if (!data) {
      this._id = UUID()
      this.openedDate = Date.now()
      return
    }
    this._id = data._id
    this._rev = data._rev
    // FormResponse properties.
    this.collection = 'TangyFormResponse'
    this.form = data.form 
    this.items = data.items
    this.focusIndex = data.focusIndex
    this.nextFocusIndex = data.nextFocusIndex
    this.previousFocusIndex =  data.previousFocusIndex
    this.startDatetime = data.startDatetime
    this.startUnixtime = data.startUnixtime
    this.uploadDatetime = data.uploadDatetime
    this.complete = data.complete 
    // Specific FormResponse Type properties.
    this.status = data.status
    this.openedDate = data.openedDate
    this.disabledEventDefinitionIds = data.disabledEventDefinitionIds ? data.disabledEventDefinitionIds : []
    this.caseDefinitionId = data.caseDefinitionId
    this.label = data.label
    this.events = data.events.map(caseEventData => new CaseEvent(
      caseEventData.id,
      caseEventData.complete,
      caseEventData.name,
      caseEventData.caseEventDefinitionId,
      caseEventData.estimatedWindowStartDate,
      caseEventData.estimatedWindowEnd,
      caseEventData.eventForms,
      caseEventData.startDate
    ))
  }
}

export { Case }