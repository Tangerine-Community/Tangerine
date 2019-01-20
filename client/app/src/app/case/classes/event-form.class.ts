export class EventForm {
  id:string;
  formId:string;
  name:string;
  required:boolean;
  constructor(data) {
    this.id = data.id
    this.formId = data.formid
    this.name = data.name
    this.required = data.required
  }
}