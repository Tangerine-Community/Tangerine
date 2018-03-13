
export class TangyFormResponseModel {
  constructor(props) {
    this._id = uuid()
    this.collection = 'TangyFormResponse'
    // Placeholders for where element.getProps() info will go.
    this.form = {}
    this.items = []
    this.inputs = []
    // States.
    this.complete = false
    // Focus indexes.
    // @TODO: We can probably get rid of these indexes.
    this.focusIndex = 0
    this.nextFocusIndex = 1 
    this.previousFocusIndex =  -1
    // Info.
    this.startDatetime = (new Date()).toLocaleString(),
    this.startUnixtime = Date.now(),
    this.uploadDatetime = ''
    Object.assign(this, props)
  }

  flatten() {
    variables = {}
    this.items.forEach(item => { 
      item.inputs.forEach(input => { 
        if (typeof input.value === 'object') {
          input.value.forEach(subInput => variables[`${input.name}.${subInput.name}`] = subInput.value)
        } else {
          variables[input.name] = input.value
        }
      })
    })
    return variables
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