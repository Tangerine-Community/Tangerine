import UUID from 'uuid/v4';
import { EventForm } from './event-form.class'
import { EventFormDefinition } from './event-form-definition.class'

class CaseEventDefinition {
  id:string;
  name:string;
  description:string;
  repeatable:boolean = false;
  eventFormDefinitions:Array<EventFormDefinition> = []
  constructor(init:CaseEventDefinition) {
    Object.assign(this, init);
    /*
    this.id = data.id 
    this.name = data.name
    this.description = data.description
    this.repeatable = data.repeatable
    this.forms = data.forms.map(formData => new EventForm(formData))
    */
  }
}

export { CaseEventDefinition }