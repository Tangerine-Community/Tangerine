import { LockBoxContents } from './../_classes/lock-box-contents.class';
import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { LockBox } from './../_classes/lock-box.class'
import { DB } from '../_factories/db.factory';

@Injectable({
  providedIn: 'root'
})
export class LockBoxService {

  db = DB('tangerine-lock-boxes')
  _openLockBoxes = []

  constructor() { }

  async uninstall() {
    await this.db.destroy()
  }

  async fillLockBox(username:string, password:string, lockBoxContents:LockBoxContents ) {
    let lockBox = new LockBox()
    try {
      lockBox = await this.db.get(username)
    } catch (e) {
      //
    }
    lockBox.contents = lockBoxContents
    await this.db.put({
      ...lockBox,
      _id: username,
      contents: CryptoJS.AES.encrypt(JSON.stringify(lockBox.contents), password).toString()
    })
  }

  lockBoxIsOpen(username) {
    return this.getOpenLockBoxes().find(lockBox => lockBox._id === username)
      ? true
      : false
  }

  getOpenLockBox(username = ''):LockBox {
    // If no username specified, assume there is only one open lockbox and that's what we want.
    // The idea of multiple open lockboxes may go away... But may come in handy when updating lockboxes, we'll see.
    return username
      ? this.getOpenLockBoxes().find(lockBox => lockBox._id === username)
      : this.getOpenLockBoxes()[0]

  }

  closeLockBox(username) {
    this.setOpenLockBoxes(
      this.getOpenLockBoxes()
        .filter(lockBox => lockBox._id !== username)
    )
  }

  async openLockBox(username, password) {
    const lockBoxData = await this.db.get(username)
    const lockBoxContentsDescrypted = CryptoJS.AES.decrypt(lockBoxData.contents, password)
    const codepage = CryptoJS.enc.Utf8
    const lockBox = <LockBox>{
      ...lockBoxData,
      contents: JSON.parse(lockBoxContentsDescrypted.toString(codepage))
    }
    const openLockBoxes = this.getOpenLockBoxes()
    openLockBoxes.push(lockBox)
    this.setOpenLockBoxes(openLockBoxes)
  }

  getOpenLockBoxes():Array<LockBox> {
    return this._openLockBoxes
  }

  setOpenLockBoxes(openLockBoxes) {
    this._openLockBoxes = openLockBoxes
  }

}
