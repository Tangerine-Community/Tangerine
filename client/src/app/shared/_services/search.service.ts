import { createSearchIndex } from './create-search-index';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { HttpClient } from '@angular/common/http';
import { ActivityService } from 'src/app/shared/_services/activity.service';
import {UserDatabase} from "../_classes/user-database.class";
import { Index, Document, Worker } from 'flexsearch'
import {SyncService} from "../../sync/sync.service";
import {AppConfigService} from "./app-config.service";

export class SearchDoc {
  _id: string
  formId: string
  formType: string
  lastModified:number
  variables: any
  matchesOn: string
  doc: any
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private readonly userService:UserService,
    private readonly http:HttpClient,
    private readonly formsInfoService:TangyFormsInfoService,
    private readonly activityService:ActivityService,
    private readonly syncService:SyncService,
    private appConfigService:AppConfigService,
  ) { }

  compareLimit: number = 150

  async createIndex(username:string = '') {
    const appConfig = await this.appConfigService.getAppConfig()
    this.compareLimit = appConfig.compareLimit ? appConfig.compareLimit : this.compareLimit
    let db
    if (!username) {
      db = await this.userService.getUserDatabase()
    } else {
      db = await this.userService.getUserDatabase(username)
    }
    let customSearchJs = ''
    try {
      customSearchJs = await this.http.get('./assets/custom-search.js', {responseType: 'text'}).toPromise()
    } catch (err) {
      // No custom-search.js, no problem.
    }
    const formsInfo = await this.formsInfoService.getFormsInfo()
    await createSearchIndex(db, formsInfo, customSearchJs) 
  }

  async search(username:string, phrase:string, limit = 50, skip = 0):Promise<Array<SearchDoc>> {
    const db = await this.userService.getUserDatabase(username)
    let result:any = {}
    let activity = []
    if (phrase === '') {
      activity = await this.activityService.getActivity()
    }
    // Only show activity if they have enough activity to fill a page.
    if (phrase === '' && activity.length >= 11) {
      const page = activity.slice(skip, skip + limit)
      result = await db.allDocs(
        { 
          keys: page,
          include_docs: true
        }
      )
      // Sort it because the order of the docs returned is not guaranteed by the order of the keys parameter.
      result.rows = page.map(id => result.rows.find(row => row.id === id))
    } else {
      result = await db.query(
        'search',
        { 
          startkey: `${phrase}`.toLocaleLowerCase(),
          endkey: `${phrase}\uffff`.toLocaleLowerCase(),
          include_docs: true,
          limit,
          skip
        }
      )
    }
    const searchResults = result.rows.map(row => {
      const variables = row.doc.items.reduce((variables, item) => {
        return {
          ...variables,
          ...item.inputs.reduce((variables, input) => {
            return {
              ...variables,
              [input.name] : input.value
            }
          }, {})
        }
      }, {})
      return {
        _id: row.doc._id,
        matchesOn: row.value,
        formId: row.doc.form.id,
        formType: row.doc.type,
        lastModified: row.doc.lastModified,
        doc: row.doc,
        variables
      }
    })
    // Deduplicate the search results since the same case may match on multiple variables.
    let uniqueResults = searchResults.reduce((uniqueResults, result) => {
      return uniqueResults.find(x => x._id === result._id)
        ? uniqueResults
        : [ ...uniqueResults, result ]
    }, [])

    return uniqueResults.sort(function (a, b) {
        return b.lastModified - a.lastModified;
      })
  }

  async indexDocs() {
    let userDb: UserDatabase = await this.userService.getUserDatabase()
    const formsInfo = await this.formsInfoService.getFormsInfo()
    const variablesToIndexByFormId = formsInfo.reduce((variablesToIndexByFormId, formInfo) => {
      return formInfo.searchSettings?.shouldIndex
        ? {
          ...variablesToIndexByFormId,
          [formInfo.id]: formInfo.searchSettings.variablesToIndex
        }
        : variablesToIndexByFormId
    }, {})
    const index = new Index({tokenize: "forward"});
    const options = {limit: this.compareLimit, include_docs: true, selector: null}
    const database = userDb.db
    const dbName = "local device"
    let allDocs = []
    let remaining = true
    let total_rows = 0
    let queryFunction = "allDocs"
    let responseArrayName = "rows"
    let pagerKeyName = "startkey"
    if (options.selector) {
      queryFunction = "find"
      responseArrayName = "docs"
      pagerKeyName = "bookmark"
    }
    while (remaining === true) {
      try {
        const response = await database[queryFunction](options)
        if (response && response[responseArrayName].length > 0) {
          if (options.selector) {
            const pagerKey = response[pagerKeyName]
            allDocs.push(...response[responseArrayName])
            options[pagerKeyName] = pagerKey
          } else {
            total_rows = response.total_rows
            const responseLength = response[responseArrayName].length
            const pagerKey = response[responseArrayName][responseLength - 1].id
            // Remove the last item (to be used as pagerKey) and add to the allDocs array
            allDocs.push(...response[responseArrayName].splice(0, responseLength - 1))
            if (responseLength === 1 && pagerKey === options[pagerKeyName]) {
              allDocs.push(response[responseArrayName][0])
              remaining = false
            } else {
              options[pagerKeyName] = pagerKey
            }
          }

          let message = 'Collected ' + allDocs.length + ' out of ' + total_rows + ' docs from the ' + dbName + ' for comparison.';
          if (options.selector) {
            message = 'Collected ' + allDocs.length + ' docs from the ' + dbName + ' for comparison.';
          }
          console.log(message)
          // this.syncMessage$.next({
          //   message: window['t'](message)
          // })
          if (allDocs.length > 0) {
            for (let i = 0; i < allDocs.length; i++) {
              const doc = allDocs[i].doc
              const formId = doc.form?.id
              const id = doc._id
              if (formId) {
                let allInputsValueByName = doc.items.reduce((allInputsValueByName, item) => {
                  return {
                    ...allInputsValueByName,
                    ...item.inputs.reduce((itemInputsValueByName, input) => {
                      return {
                        ...itemInputsValueByName,
                        [input.name]: `${input.value}`.toLocaleLowerCase()
                      }
                    }, {})
                  }
                }, {})
                const variablesToIndex = variablesToIndexByFormId[doc.form.id]
                if (variablesToIndex && variablesToIndex.length > 0) {
                  for (let j = 0; j < variablesToIndex.length; j++) {
                    const variableToIndex = variablesToIndex[j]
                    const key = id+'_'+j
                    const value = allInputsValueByName[variableToIndex]
                    if (value) {
                      await index.addAsync(key, value);
                      console.log("Added: " + key + ":" + value)
                    }
                  }
                }
              }
            }
          }
        } else {
          remaining = false
        }
      } catch (e) {
        console.log("Error getting allDocs: " + e)
      }
    }
    console.log("total_rows: " + total_rows)
    return index;
  }

}

