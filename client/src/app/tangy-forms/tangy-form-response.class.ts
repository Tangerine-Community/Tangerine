export class TangyFormResponse {
  _id:string;
  _rev:string;
  collection = 'TangyFormResponse'
  complete = false
  formType = 'form'
  form:TangyForm;
  items:Array<any>;

  get variablesArray() {
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

  get variables() {
    // Reduce to an object keyed on input.name. If multiple inputs with the same name, put them in an array.
    return this.variablesArray.reduce((inputsObject, input) => {
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
}

export class TangyForm {
  id:string
}