class TangyFormResponseModel {
  constructor(props) {
    this._id = ''
    this.collection = 'TangyFormResponse'
    // Placeholders for where element.getProps() info will go.
    this.form = {}
    this.items = []
    this.inputs = []
    // States.
    complete: false,
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
}