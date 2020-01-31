import { LockBoxContents } from './../_classes/lock-box-contents.class';
import * as CryptoJS from 'crypto-js';
import PouchDB from 'pouchdb';
import { Injectable } from '@angular/core';
import { LockBox } from './../_classes/lock-box.class'

const TANGERINE_OPEN_LOCKERS = 'TANGERINE_OPEN_LOCKERS' 


@Injectable({
  providedIn: 'root'
})
export class LockBoxService {

  db = new PouchDB('tangerine-lock-boxes')

  constructor() { }

  install() {
    localStorage.setItem(TANGERINE_OPEN_LOCKERS, '[]')
  }

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

  getOpenLockBox(username):LockBox {
    return this.getOpenLockBoxes()
      .find(lockBox => lockBox._id === username)
  }

  closeLockBox(username) {
    this.setOpenLockBoxes(
      this.getOpenLockBoxes()
        .filter(lockBox => lockBox._id !== username)
    )
  }

  async openLockBox(username, password) {
    const lockBoxData = await this.db.get(username)
    const lockBox = <LockBox>{
      ...lockBoxData,
      contents: JSON.parse(CryptoJS.AES.decrypt(lockBoxData.contents, password).toString(CryptoJS.enc.Utf8))
    }
    const openLockBoxs = this.getOpenLockBoxes()
    openLockBoxs.push(lockBox)
    this.setOpenLockBoxes(openLockBoxs)
  }

  getOpenLockBoxes():Array<LockBox> {
    const openLockBoxString = localStorage.getItem(TANGERINE_OPEN_LOCKERS)
    return JSON.parse(openLockBoxString ? openLockBoxString : '[]')
  }

  setOpenLockBoxes(openLockBoxs) {
    // @Refactor to use in memory.
    localStorage.setItem(TANGERINE_OPEN_LOCKERS, JSON.stringify(openLockBoxs))
  }
  
}
