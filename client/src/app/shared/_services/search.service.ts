import { AppConfigService } from './app-config.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { UserAccount } from '../_classes/user-account.class';
import { UserService } from './user.service';
import PouchDB from 'pouchdb';
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo, FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { Subject } from 'rxjs';

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
  formsInfo:Array<FormInfo>
  subscribedToLoggedInUser$ = new Subject()
  didIndex$ = new Subject()

  constructor(
    private readonly authService:AuthenticationService,
    private readonly configService:AppConfigService,
    private readonly userService:UserService,
    private readonly formsInfoService:TangyFormsInfoService
  ) { }

  async start():Promise<void> {
    if (this.authService.isLoggedIn() === true) {
      const userAccount = await this.userService.getUserAccount(this.authService.getCurrentUser())
      this.subscribeToChanges(userAccount)
    }
    this.authService.userLoggedIn$.subscribe(async (userAccount:UserAccount) => {
      this.subscribeToChanges(userAccount)
    })
    this.authService.userLoggedOut$.subscribe((userAccount:UserAccount) => {
      this.userDbSubscription.cancel()
    })
  }

  async subscribeToChanges(userAccount:UserAccount) {
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.userDb = await this.userService.getUserDatabase(userAccount._id)
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
      variables: {} 
    }
    // Populate searchDoc.variables.
    // @TODO This reduce is taken from the TangyFormResponseModel Class in the tangy-form module. At
    // some point we need to figure out why that class is not importing correctly so we can use it
    // directly. This code is at risk of getting out of sync.
    const inputsByName = doc.items.reduce((inputsArray, item) => {
      item.inputs.forEach(input => {
        if (input.tagName === 'TANGY-CARDS') {
          input.value.forEach(card => card.value.forEach(input => inputsArray.push(input)))
        } else {
          inputsArray.push(input)
        }
      })
      return inputsArray
    }, []).reduce((inputsObject, input) => {
      if (inputsObject.hasOwnProperty(input.name)) {
        if (Array.isArray(inputsObject[input.name])) {
          inputsObject[input.name] = inputsObject[input.name].push(input)
        } else {
          inputsObject[input.name] = [input, inputsObject[input.name]]
        }
      } else {
        inputsObject[input.name] = input
      }
      return inputsObject
    }, {})
    for (const variableName of formInfo.searchSettings.variablesToIndex) {
      // @TODO This only supports text values. If it's an array, should reduce.
      searchDoc.variables[variableName] = inputsByName[variableName]
        ? inputsByName[variableName].value
        : ''
    }
    return searchDoc
  }

  async indexDoc(username:string, searchDoc:SearchDoc):Promise<void> {
    const config = await this.configService.getAppConfig()
    const _indexName = `${config.sharedUserDatabase ? 'shared' : username}_search`
    const indexDb = new PouchDB(_indexName)
    try {
      const oldSearchDoc = await indexDb.get(searchDoc._id)
      indexDb.put({...searchDoc, ...{_rev: oldSearchDoc._rev}})
    } catch(e) {
      try {
        indexDb.put(searchDoc)
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
    const config = await this.configService.getAppConfig()
    const _indexName = `${config.sharedUserDatabase ? 'shared' : username}_search` 
    const indexDb = new PouchDB(_indexName)
    const allDocs = (await indexDb.allDocs({include_docs:true})).rows.map(row => <SearchDoc>row.doc).sort(function (a, b) {
      return b.lastModified - a.lastModified;
    })
    return phrase === ''
      ? allDocs
      : allDocs.filter(doc => JSON.stringify(doc).search(phrase) !== -1)
  }

  async getIndexedDoc(username:string, docId):Promise<SearchDoc> {
    const config = await this.configService.getAppConfig()
    const _indexName = `${config.sharedUserDatabase ? 'shared' : username}_search`
    const indexDb = new PouchDB(_indexName)
    return <SearchDoc>await indexDb.get(docId)
  }

}
