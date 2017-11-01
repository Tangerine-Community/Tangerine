class TangyFormResponseModel {
  constructor(props) {
    this._id = ''
    this.collection = 'TangyFormResponse'
    this.formId = ''
    this.focusItemId = ''
    this.startDatetime = (new Date()).toLocaleString(),
    this.startUnixtime = Date.now(),
    this.log = []
    this.items = []
    this.inputs = []
    this.uploadDatetime = ''
    Object.assign(this, props)
  }
}