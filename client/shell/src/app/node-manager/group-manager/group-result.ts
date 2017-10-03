export class GroupResult {
  _id = '';
  _rev = '';
  name = '';
  variables?: object = {};
  constructor(resultObject: any = {}) {
    if (resultObject.hasOwnProperty('_id')) {
      this._id = 'group1';
    } else {
      // TODO: Generate UUID.
    }
    if (resultObject.hasOwnProperty('_rev')) {
      this._rev = resultObject._rev;
    }
    if (resultObject.hasOwnProperty('name')) {
      this.name = resultObject.name;
    }
    if (resultObject.hasOwnProperty('variables')) {
      this.variables = resultObject.variables;
    }
  }

}
