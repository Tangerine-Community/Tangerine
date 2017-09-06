class TangyFormResponseModel {
  constructor(props) {
    this._id = ''
    this.type = 'tangy-form-response'
    this.form_id = ''
    this.datetime = (new Date()).toLocaleString(),
    this.unixtime = Date.now(),
    this.items = {}
    Object.assign(this, props)
  }
}