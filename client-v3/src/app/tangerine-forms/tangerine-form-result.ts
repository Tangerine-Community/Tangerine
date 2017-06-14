export class TangerineFormResult {
  _id = '';
  _rev = '';
  formId = '';
  variables: object = {};
  log: Array<any> = [];
  currentPath = '';
  pageValid = false;
  complete = false;
  constructor(resultObject: any = {}) {
    // Required to pass this in.
    if (!this.formId) {
      // TODO Should throw an error.
    } else {
      this.formId = resultObject.formId;
    }
    if (resultObject.hasOwnProperty('_id')) {
      this._id = 'result1';
    } else {
      // TODO: Generate UUID.
    }
    if (resultObject.hasOwnProperty('_rev')) {
      this._rev = resultObject._rev;
    }
    if (resultObject.hasOwnProperty('variables')) {
      this.variables = resultObject.variables;
    }
    if (resultObject.hasOwnProperty('log')) {
      this.log = resultObject.log;
    }
    if (resultObject.hasOwnProperty('currentPath')) {
      this.currentPath = resultObject.currentPath;
    }
    if (resultObject.hasOwnProperty('pageValid')) {
      this.pageValid = resultObject.pageValid;
    }
    if (resultObject.hasOwnProperty('complete')) {
      this.complete = resultObject.complete;
    }
  }
}
