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
import * as moment from "moment";
import {_TRANSLATE} from "../translation-marker";
import {Subject} from "rxjs";

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
  ) {
    this.window = window;
  }

  window: any;
  indexQueryLimit: number = 50
  indexItemSize:number = 1000

  searchMessage: any = {};
  public readonly indexingMessage$: Subject<any> = new Subject();
  public readonly searchMessage$: Subject<any> = new Subject();

  async createIndex(username:string = '') {
    const appConfig = await this.appConfigService.getAppConfig()
    this.indexQueryLimit = appConfig.indexQueryLimit ? appConfig.indexQueryLimit : this.indexQueryLimit
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

  async search(indexArray:Index[], username:string, phrase:string, limit = 50, skip = 0):Promise<Array<SearchDoc>> {
    this.searchMessage$.next({
      message: ''
    })
    const db = await this.userService.getUserDatabase(username)
    // let result:any = {}
    const indexSet = new Set()
    let activity = []
    if (phrase === '') {
      activity = await this.activityService.getActivity()
    }
    this.searchMessage$.next({
      message: 'Starting search'
    })
    const indexResults = []
    // Only show activity if they have enough activity to fill a page.
    if (phrase === '' && activity.length >= 11) {
      const page = activity.slice(skip, skip + limit)
      let currentSearchArraySize = 0
      for (let i = 0; i < indexArray.length; i++) {
        const index = indexArray[i]
        const result = index.search(phrase, { enrich: true });
      }
      // Sort it because the order of the docs returned is not guaranteed by the order of the keys parameter.
      // result.rows = page.map(id => result.rows.find(row => row.id === id))
    } else {
      let currentSearchArraySize = 0
      for (let i = 0; i < indexArray.length; i++) {
        const index = indexArray[i]
        const result = index.search(phrase, { enrich: true })
        indexResults.push(result)
      }
    }
    // const indexResults = Array.from(indexSet)
    
    const searchResults = []
    indexResults.forEach(indexResult => {
      if (indexResult.length > 0) {
        indexResult.forEach(row => {
          const results = row.result
          results.forEach(row => {
            searchResults.push(row.doc)
          })
        })
      }
    })
    // Remove undefined elements
    const filteredSearchResults = searchResults.filter(function (el) {
      return el != null;
    });
    this.searchMessage$.next({
      message: filteredSearchResults?.length + ' search results.'
    })
    return filteredSearchResults
    // Deduplicate the search results since the same case may match on multiple variables.
    // let uniqueResults = searchResults.reduce((uniqueResults, result) => {
    //   return uniqueResults.find(x => x._id === result._id)
    //     ? uniqueResults
    //     : [ ...uniqueResults, result ]
    // }, [])
    //
    // return uniqueResults.sort(function (a, b) {
    //     return b.lastModified - a.lastModified;
    //   })
  }

  async indexDocs() {
    const startTime = new Date().toISOString()
    console.log("indexing startTime: " + startTime)
    const appConfig = await this.appConfigService.getAppConfig()
    const groupId = appConfig.groupId
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
    // const index = new Worker({tokenize: "strict"});
    const indexes = {};
    let index = new Document({
      document: {
        id: "id",
        index: "matchesOn",
        store: ["matchesOn", "formId","formType","lastModified","variables"]
      }
    })
    let add = async (id, seq, searchResult) => {
      if (indexes[seq]) {
        // await index.addAsync(id, content);
        index.addAsync({
          id: id,
          matchesOn: searchResult.matchesOn,
          formId: searchResult.formId,
          formType: searchResult.formType,
          lastModified: searchResult.lastModified,
          variables: searchResult.variables,
        });
        console.log("Added: " + id + ":" + searchResult.matchesOn + " to seq: " + seq)
      } else {
        const previousSeq = seq - 1
        if (previousSeq > 0) {
          // export previous index
          let time = new Date().toISOString()
          let message = time + ' : About to save index ' + previousSeq;
          console.log(message)
          try {
            await this.exportSearchIndex(groupId, index, previousSeq);
          } catch (e) {
            console.log(e)
          }
          time = new Date().toISOString()
          message = time + ' : Saved index ' + previousSeq;
          console.log(message)
        }
        // Create a new index
        indexes[seq] = true
        // index = new Index({tokenize: "full"})
        index = new Document({
          document: {
            id: "id",
            index: "matchesOn",
            store: ["matchesOn", "formId","formType","lastModified","variables"]
          }
        })
        index.addAsync({
          id: id,
          matchesOn: searchResult.matchesOn,
          formId: searchResult.formId,
          formType: searchResult.formType,
          lastModified: searchResult.lastModified,
          variables: searchResult.variables,
        });
        console.log("Added: " + id + ":" + searchResult.matchesOn + " to new seq: " + seq)
      }

    }
    const options = {limit: this.indexQueryLimit, include_docs: true, selector: null}
    const database = userDb.db
    const dbName = "local device"
    let allDocs = []
    let remaining = true
    let total_rows = 0
    let currentDocsProcessed = 0
    let queryFunction = "allDocs"
    let responseArrayName = "rows"
    let pagerKeyName = "startkey"
    if (options.selector) {
      queryFunction = "find"
      responseArrayName = "docs"
      pagerKeyName = "bookmark"
    }
    let cnt = 0
    let seq = 1
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
                  // const key = id
                  let concatedValues = ""
                  for (let j = 0; j < variablesToIndex.length; j++) {
                    const variableToIndex = variablesToIndex[j]
                    const key = id+'_'+j
                    let value = allInputsValueByName[variableToIndex]
                    if (value && value !== '') {
                      // concatedValues = concatedValues + " " + value.trim()

                      // const searchResults = doc.rows.map(row => {
                      //   if (row.error !== 'not_found') {
                          const variables = doc.items.reduce((variables, item) => {
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
                      const searchResult =  {
                            _id: doc._id,
                            matchesOn: value,
                            formId: doc.form.id,
                            formType: doc.type,
                            lastModified: doc.lastModified,
                            variables
                          }
                        // }
                      // })
                      
                      // const content = JSON.stringify(searchResult)
                      
                      cnt++
                      if (cnt > this.indexItemSize) {
                        seq++
                        cnt = 0
                      }
                      await add(key, seq, searchResult)
                    }
                  } 
                  // if (concatedValues.trim() !== '') {
                  //   await index.addAsync(key, concatedValues.trim());
                  //   console.log("Added: " + key + ":" + concatedValues)
                  // }
                }
              }
            }
          }
          currentDocsProcessed = currentDocsProcessed + allDocs.length
          const time = new Date().toISOString()
          // await this.exportSearchIndex(groupId, index);
          let message = time + ' : Indexed ' + currentDocsProcessed + ' out of ' + total_rows + ' docs from the ' + dbName + '.';
          if (options.selector) {
            message = time + ': Indexed ' + currentDocsProcessed + ' docs from the ' + dbName + '.';
          }
          console.log(message)
          this.indexingMessage$.next({
            message: currentDocsProcessed + '/' + total_rows
          })
        } else {
          remaining = false
        }
      } catch (e) {
        console.log("Error getting allDocs: " + e)
      }
      // clear out alldocs
      allDocs.length = 0
    }
    const time = new Date().toISOString()
    await this.exportSearchIndex(groupId, index, seq);
    let message = time + ' : Saved ' + seq + ' index.';
    console.log(message)
    console.log("total_rows: " + total_rows)
    const endTime = new Date().toISOString()
    console.log("indexing endTime: " + endTime)
    const start = moment(startTime)
    const end = moment(endTime)
    const diff = end.diff(start)
    const duration = moment.duration(diff).as('milliseconds')
    console.log("Indexing duration: " + duration + " milliseconds")
    this.indexingMessage$.next({
      message: "Indexing Complete."
    })
    return index;
  }

  async exportSearchIndex(groupId: string, index:Index, seq: number) {
    let indexesDir, indexesDirEntry
    if (this.window.isCordovaApp) {
      const entry = await new Promise<Entry>((resolve, reject) => {
        this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, resolve, reject);
      });
      // We know this path is a directory
      const directory = entry as DirectoryEntry;
      await new Promise((resolve, reject) => {
        directory.getDirectory('Documents', {create: true}, (dirEntry) => {
          dirEntry.getDirectory('Tangerine', {create: true}, (dirEntry) => {
            dirEntry.getDirectory('indexes', {create: true}, (dirEntry) => {
              dirEntry.getDirectory(groupId, {create: true}, resolve, reject);
            }, this.onErrorGetDir);
          }, this.onErrorGetDir);
        })
      })
      indexesDir = cordova.file.externalRootDirectory + 'Documents/Tangerine/indexes/' + groupId + '/'
      try {
        indexesDirEntry = await new Promise((resolve, reject) =>
          this.window.resolveLocalFileSystemURL(indexesDir, resolve, reject)
        );
      } catch (e) {
        let message = "Unable to access " + indexesDir + " Error: " + JSON.stringify(e);
        console.error(message)
        alert(message)
      }

      try {
        await index.export(function (key, data): Promise<any> {
          return new Promise(async (resolve, reject) => {
            const indexFileName = key + "-" + seq
            indexesDirEntry.getFile(indexFileName, {create: true}, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = (data) => {
                  console.log(`Index stored at ${groupId}/${indexFileName}`)
                }
                fileWriter.onerror = (e) => {
                  alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                }
                fileWriter.write(data);
              })
              resolve()
            }, reject('Could not get index.' + key))
          })
        })
      } catch (e) {
        console.log('Error getting index seq: ' + seq + ' message' + e)
        this.indexingMessage$.next({
          message: ' Error: ' + e
        })
      }
    }
  }
  
  onErrorGetDir(e) {
    console.log("Error: " + e)
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = "File or directory not found."
    } else {
      errorMessage = e
    }
    const message = `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
    console.log(message)
  }

  async loadSearchIndex() {
    const appConfig = await this.appConfigService.getAppConfig()
    const groupId = appConfig.groupId
    let indexesDir, indexesDirEntry

    if (this.window.isCordovaApp) {
      indexesDir = cordova.file.externalRootDirectory + 'Documents/Tangerine/indexes/'+ groupId + '/'
      try {
        indexesDirEntry = await new Promise((resolve, reject) =>
          this.window.resolveLocalFileSystemURL(indexesDir, resolve, reject)
        );
      } catch (e) {
        let message = "Unable to access " + indexesDir + " Error: " + JSON.stringify(e);
        console.error(message)
        alert(message)
      }
      const indexDirEntries: any[] = await new Promise(resolve => {
        const reader = indexesDirEntry.createReader();
        reader.readEntries((entries) => resolve(entries))
      });

      // if (indexDirEntries.length > 0) {
      //   this.indexFilesToSync = true
      // }
      // Find all of the indexes, get the sequence number
      const indexSet = new Set()
      for (let j = 0; j < indexDirEntries.length; j++) {
        const entry = indexDirEntries[j]
        const fileName = entry.name
        const sequence = fileName.split('-')
        indexSet.add(sequence[1])
      }
      const indexSequences = Array.from(indexSet)
      const indexes:Index[] = []
      for (let i = 0; i < indexSequences.length; i++) {
        // const index = new Index({tokenize: "full"});
        let index = new Document({
          document: {
            id: "id",
            index: "matchesOn",
            store: ["matchesOn", "formId","formType","lastModified","variables"]
          }
        })
        const seq = indexSequences[i]
        // const fileName = entry.name
        
        // import register
        let key = 'reg'
        let fileName = 'reg-' + seq
        let file:string
        try {
          file = await this.getFile(indexesDirEntry, fileName);
          index.import(key, file)
          console.log("Index loaded the file " + fileName)
        } catch (e) {
          console.log('Error getting file: ' + fileName + ' message' + e)
          this.searchMessage$.next({
            message: ' Error: ' + e
          })
        }
        
        // import store
        key = 'store'
        fileName = 'store-' + seq
        try {
          file = await this.getFile(indexesDirEntry, fileName);
          index.import(key, file)
          console.log("Index loaded the file " + fileName)
        } catch (e) {
          console.log('Error getting file: ' + fileName + ' message' + e)
          this.searchMessage$.next({
            message: ' Error: ' + e
          })
        }
        
        // import store
        key = 'matchesOn.map'
        fileName = 'matchesOn.map-' + seq
        try {
          file = await this.getFile(indexesDirEntry, fileName);
          index.import(key, file)
          console.log("Index loaded the file " + fileName)
        } catch (e) {
          console.log('Error getting file: ' + fileName + ' message' + e)
          this.searchMessage$.next({
            message: ' Error: ' + e
          })
        }
        
        indexes.push(index)
        this.searchMessage$.next({
          message: ' Loaded index ' + i
        })
      }
      return indexes
    }
  }

  private async getFile(indexesDirEntry: DirectoryEntry, fileName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const fileEntry = await new Promise((resolve, reject) => {
          (indexesDirEntry as DirectoryEntry).getFile(fileName, {create: false, exclusive: false}, resolve, reject);
        }
      ).catch(error => reject(error))
      if (fileEntry) {
        const file: File = await new Promise((resolve, reject) => {
          (fileEntry as FileEntry).file(resolve, reject)
        })
        const reader = this.getFileReader();
        let result: string | ArrayBuffer = ""
        reader.onloadend = function () {
          // console.log("Successful file read: " + this.result)
          result = this.result
          // displayFileData(fileEntry.fullPath + ": " + this.result);
          // index.import(key, this.result)
          // console.log("Index loaded the file " + fileName)
          // indexes.push(index)
          resolve(result)
        }
        reader.readAsText(file);
      } else {
        reject('Unable to get file.')
      }
      
    })
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

}

