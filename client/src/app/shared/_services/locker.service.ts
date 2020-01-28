import { LockerContents } from './../_classes/locker-contents.class';
import * as CryptoJS from 'crypto-js';
import { PouchDB } from 'pouchdb';
import { Injectable } from '@angular/core';
import { Locker } from '../_classes/locker.class';

const TANGERINE_OPEN_LOCKERS = 'TANGERINE_OPEN_LOCKERS' 


@Injectable({
  providedIn: 'root'
})
export class LockerService {

  db = new PouchDB('lockers')

  constructor() { }

  install() {
    localStorage.setItem(TANGERINE_OPEN_LOCKERS, '[]')
  }

  async uninstall() {
    await this.db.destroy()
  }

  async fillLocker(username:string, password:string, lockerContents:LockerContents ) {
    let locker = new Locker()
    try {
      locker = await this.db.get(username)
    } catch (e) {
      //
    }
    locker.contents = lockerContents
    await this.db.put({
      ...locker,
      contents: CryptoJS.AES.encrypt(JSON.stringify(locker.contents), password).toString()
    })
  }

  lockerIsOpen(username) {
    return this.getOpenLockers().find(locker => locker._id === username)
      ? true
      : false
  }

  getOpenLocker(username):Locker {
    return this.getOpenLockers()
      .find(locker => locker._id === username)
  }

  closeLocker(username) {
    this.setOpenLockers(
      this.getOpenLockers()
        .filter(locker => locker._id !== username)
    )
  }

  async openLocker(username, password) {
    const lockerData = await this.db.get(username)
    const locker = <Locker>{
      ...lockerData,
      contents: JSON.parse(CryptoJS.AES.encrypt(lockerData.contents, password).toString())
    }
    const openLockers = this.getOpenLockers()
    openLockers.push(locker)
    this.setOpenLockers(openLockers)
  }

  getOpenLockers():Array<Locker> {
    const openLockerString = localStorage.getItem(TANGERINE_OPEN_LOCKERS)
    return JSON.parse(openLockerString ? openLockerString : '[]')
  }

  setOpenLockers(openLockers) {
    localStorage.setItem(TANGERINE_OPEN_LOCKERS, JSON.stringify(openLockers))
  }
  
}
