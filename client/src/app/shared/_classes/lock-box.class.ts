import uuid from 'uuid/v4';
import { LockBoxContents } from './lock-box-contents.class';
export class LockBox {
  _id:string = uuid() 
  contents:LockBoxContents
}