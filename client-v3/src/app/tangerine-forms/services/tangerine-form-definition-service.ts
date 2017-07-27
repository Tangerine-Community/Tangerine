import {Injectable} from "@angular/core";

@Injectable()
export class TangerineFormDefinitionService {
  constructor() {
  }

  getForm(id) {
    if (id === 'efcard1') {
      return this.efcard1
    }
     return null;
   }
  efcard1 =  {
    "id": "efcard1",
    "fields":
      [
        {
          "type": "input",
          "key": "variable1",
          "templateOptions":
            {
              "required": true,
              "label": "Variable1",
              "type": "text"
            }
        },
        {
          "type": "input",
          "key": "variable2",
          "templateOptions":
            {
              "required": true,
              "label": "Variable2",
              "type": "text"
            }
        }
      ]
  }
}
