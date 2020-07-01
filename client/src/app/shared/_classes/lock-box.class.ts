import { v4 as uuid } from 'uuid';
import { LockBoxContents } from './lock-box-contents.class';
export class LockBox {
  _id:string = uuid()
  contents:LockBoxContents
}
