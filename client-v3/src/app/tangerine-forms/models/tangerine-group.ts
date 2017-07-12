export class TangerineGroup {
  _id:string = '';
  _rev:string = '';
  name:string = '';
  collection:string = 'group';
  type:string = 'group';
  parent?:TangerineGroup;
}
