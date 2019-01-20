import UUID from 'uuid/v4';
import { EventForm } from './event-form.class'

class CaseEventDefinition {
  id:string;
  name:string;
  description:string;
  repeatable:boolean = false;
  forms:Array<EventForm> = []
  constructor(data) {
    this.id = data.id 
    this.name = data.name
    this.description = data.description
    this.repeatable = data.repeatable
    this.forms = data.forms.map(formData => new EventForm(formData))
  }
}

export { CaseEventDefinition }