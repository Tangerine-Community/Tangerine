export class Group {
  _id:string = '';
  _rev:string = '';
  name:string = '';
  parent?:Group;
}
