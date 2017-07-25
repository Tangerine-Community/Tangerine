import {Injectable} from "@angular/core";

@Injectable()
export class TangerineFormDefinitionService {
  constructor() {
  }
  card1 =  {
    "id": "card1",
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
