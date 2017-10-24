class TangyFormResponseModel {
  constructor(props) {
    this._id = ''
    this.collection = 'TangyFormResponse'
    this.formId = ''
    this.focusItemId = ''
    this.startDatetime = (new Date()).toLocaleString(),
    this.startUnixtime = Date.now(),
    this.variables = {}
    this.log = []
    this.items = {}
    this.uploadDatetime = ''
    Object.assign(this, props)
  }
}