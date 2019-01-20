export class EventFormDefinition {
  id:string
  formId:string
  name:string
  required:boolean
  repeatable:boolean
  public constructor(init:EventFormDefinition) {
    Object.assign(this, init);
  }
}