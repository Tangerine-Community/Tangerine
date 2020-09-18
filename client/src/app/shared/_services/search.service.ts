import { DeviceService } from './../../device/services/device.service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { LockBoxService } from './lock-box.service';
import { AppConfigService } from './app-config.service';
import { Injectable } from '@angular/core';
import { UserAccount } from '../_classes/user-account.class';
import { UserService } from './user.service';
import PouchDB from 'pouchdb';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo, FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { Subject } from 'rxjs';
import { DB } from '../_factories/db.factory';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


export class SearchDoc {
  _id: string
  formId: string
  formType: string
  lastModified:number
  variables: any
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  userDbSubscription:any
  userDb:PouchDB
  indexDb:PouchDB
  formsInfo:Array<FormInfo>
  subscribedToLoggedInUser$ = new Subject()
  didIndex$ = new Subject()

  constructor(
    private readonly deviceService:DeviceService,
    private readonly configService:AppConfigService,
    private readonly userService:UserService,
    private readonly formsInfoService:TangyFormsInfoService
  ) { }

  async start():Promise<void> {
    if (this.userService.isLoggedIn() === true) {
      const userAccount = await this.userService.getUserAccount(this.userService.getCurrentUser())
      this.subscribeToChanges(userAccount)
    }
    this.userService.userLoggedIn$.subscribe(async (userAccount:UserAccount) => {
      this.subscribeToChanges(userAccount)
    })
    this.userService.userLoggedOut$.subscribe((userAccount:UserAccount) => {
      this.userDbSubscription.cancel()
    })
  }

  async subscribeToChanges(userAccount:UserAccount) {
    const appConfig = await this.configService.getAppConfig()
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.userDb = (await this.userService.getUserDatabase(userAccount._id)).db
    if (appConfig.syncProtocol === '2') {
      const device = await this.deviceService.getDevice()
      this.indexDb = DB(`${this.userDb.name}-index`, device.key)
    } else {
      this.indexDb = DB(`${this.userDb.name}-index`)
    }
    // Refactor to use batch processing, not changes feed which can lead to race conditions.
    this.userDbSubscription = this.userDb
      .changes({include_docs:true, since:'now', live:true})
      .on('change', change => {
        if (!change.doc.form || !change.doc.form.id) return
        const formInfo = this.formsInfo.find(formInfo => formInfo.id === change.doc.form.id)
        if ( !formInfo || !formInfo.searchSettings || !formInfo.searchSettings.shouldIndex) return
        const searchDoc = this.formResponseToSearchDoc(change.doc, formInfo)
        this.indexDoc(userAccount._id, searchDoc)
      })
    this.subscribedToLoggedInUser$.next(true)
  }

  formResponseToSearchDoc(doc, formInfo:FormInfo):SearchDoc {
    const searchDoc = <SearchDoc>{
      _id: doc._id,
      formId: doc.form.id,
      formType: formInfo.type ? formInfo.type : 'form',
      lastModified: Date.now(),
      tangerineModifiedOn: new Date(doc.tangerineModifiedOn).getTime(),
      variables: {}
    }
    const response = new TangyFormResponseModel(doc)
    for (const variableName of formInfo.searchSettings.variablesToIndex) {
      // @TODO This only supports text values. If it's an array, should reduce.
      searchDoc.variables[variableName] = response.inputsByName[variableName]
        ? response.inputsByName[variableName].value
        : ''
    }
    return searchDoc
  }

  async indexDoc(username:string, searchDoc:SearchDoc):Promise<void> {
   try {
      const oldSearchDoc = await this.indexDb.get(searchDoc._id)
      this.indexDb.put({...searchDoc, ...{_rev: oldSearchDoc._rev}})
    } catch(e) {
      try {
        this.indexDb.put(searchDoc)
      } catch(e) {
        // This is likely to happen during sync of a doc with many replications. Note the @TODO about
        // refactoring out the changes feed subscription.
        console.log("Unable to index search doc:")
        console.log(searchDoc)
        console.log(e)
      }
    }
    this.didIndex$.next(true)
  }

  async search(username:string, phrase:string):Promise<Array<SearchDoc>> {
    // Prevent race conditions when logging in. Components may load and search before our observable listening
    // for login creates this db.
    while (!this.indexDb) {
      await sleep(1000)
    }
    return await this._search(username, phrase)
  }

  async _search(username:string, phrase:string):Promise<Array<SearchDoc>> {
    let options;
    if (phrase === '') {
       options = {
        include_docs: true,
        limit: 25
      };
    } else {
      options = {
        include_docs: true
      };
    }
    const allDocs = (await this.indexDb.allDocs(options)).rows.map(row => <SearchDoc>row.doc).sort(function (a, b) {
      return b.tangerineModifiedOn - a.tangerineModifiedOn;
    })
    return phrase === ''
      ? allDocs
      : allDocs.filter(doc => JSON.stringify(doc).toLowerCase().search(phrase.toLowerCase()) !== -1)
  }

  async getIndexedDoc(username:string, docId):Promise<SearchDoc> {
    return <SearchDoc>await this.indexDb.get(docId)
  }

}
