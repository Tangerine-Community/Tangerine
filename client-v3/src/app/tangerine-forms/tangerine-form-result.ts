export class TangerineFormResult {
  _id: '';
  _rev: '';
  formId: '';
  variables: object = {};
  log: Array<any> = [];
  currentPath = '';
  currentPageVariables: object;
  currentPageStatus: '';
  complete = false;
}
