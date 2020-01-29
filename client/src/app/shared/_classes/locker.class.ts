import uuid from 'uuid/v4';
import { LockerContents } from './locker-contents.class';
export class Locker {
  _id:string = uuid() 
  contents:LockerContents
}