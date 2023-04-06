export class TangyFormResponseModel {
  constructor(props) {
    this._id = uuid()
    this.collection = 'TangyFormResponse'
    // Placeholders for where element.getProps() info will go.
    this.form = {}
    this.items = []
    // States.
    this.complete = false
    this.hasUnlocked = false
    // Focus indexes.
    // @TODO: We can probably get rid of these indexes.
    this.focusIndex = 0
    this.nextFocusIndex = 1 
    this.previousFocusIndex =  -1
    // Info.
    this.startDatetime = (new Date()).toLocaleString(),
    this.startUnixtime = Date.now(),
    this.uploadDatetime = ''
    this.location = {}
    this.type = 'response'
    if (props && props.hasOwnProperty('inputs')) delete props.inputs
    Object.assign(this, props)
  }

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

  get(name) {
    let value = ''
    let foundInput = this.inputsByName[name]
    if (foundInput && typeof foundInput.value === 'object') {
      let values = []
      foundInput.value.forEach(subInput => {
        if (subInput.value) {
          values.push(subInput.name)
        }
      })
      value = values
    } else if (foundInput && foundInput.value !== undefined) {
      value = foundInput.value
    }
    // Return radio buttons as a single value chosen, not a single entry array.
    if (foundInput && foundInput.tagName === 'TANGY-RADIO-BUTTONS' && Array.isArray(value)) {
      value = (value.length > 0) ? value[0] : ''
    }
    if (!value) {
      value = ''
    }
    return value
  }

  set(name, value) {
    if (this.inputsByName[name]) {
      this.inputsByName[name].value = this.inputsByName[name].tagName === 'TANGY-RADIO-BUTTONS'
        ? this.inputsByName[name].value.map(option => {
            option.name === value
              ? 'on'
              : ''
          })
        : value
    } else {
      this.items[0].inputs.push({
        name,
        value
      })
    }
  }

}

function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}
