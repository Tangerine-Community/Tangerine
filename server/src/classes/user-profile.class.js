const uuidV4 = require('uuid').v4

class UserProfile {
  constructor(groupId) {
    this._id = uuidV4();
    this.type = 'response'
    this.collection = 'TangyFormResponse'
    this.groupId = groupId
    this.form = { id: "user-profile" }
    this.items = [{ inputs: [] }]
    this.location = {};
    this.startDatetime = (new Date()).toLocaleString();
    this.startUnixtime = Date.now();
  }

  addInputs(inputs) {
    for (let key in inputs) {
      const input = {
        name: key,
        value: inputs[key]
      }
      // insert an unkeyed json object into the inputs array
      this.items[0].inputs.push(input)
    }
  }
}


exports.UserProfile = UserProfile