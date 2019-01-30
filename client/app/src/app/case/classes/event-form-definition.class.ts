export class EventFormDefinition {
  id:string
  formId:string
  name:string
  repeatable: boolean
  required:boolean
  constructor(data) {
    this.id = data.id
    this.formId = data.formid
    this.name = data.name
    this.required = data.required
    this.repeatable = data.repeatable
  }
}