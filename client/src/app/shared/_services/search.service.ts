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
  indexItemSize:number = 5000

  searchMessage: any = {};
  public readonly indexingMessage$: Subject<any> = new Subject();

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
    this.indexingMessage$.next({
      message: ''
    })
    const db = await this.userService.getUserDatabase(username)
    let result:any = {}
    const indexSet = new Set()
    let activity = []
    if (phrase === '') {
      activity = await this.activityService.getActivity()
    }
    this.indexingMessage$.next({
      message: 'Starting search'
    })
    // Only show activity if they have enough activity to fill a page.
    if (phrase === '' && activity.length >= 11) {
      const page = activity.slice(skip, skip + limit)
      // result = await db.allDocs(
      //   { 
      //     keys: page,
      //     include_docs: true
      //   }
      // )
      let currentSearchArraySize = 0
      for (let i = 0; i < indexArray.length; i++) {
        const index = indexArray[i]
        const results = index.search(phrase, limit)
        results.forEach(result => {
          if (currentSearchArraySize <= limit) {
            const resultArray = result.split('_')
            indexSet.add(resultArray[0])
            currentSearchArraySize++
          }
        })
      }
      // Sort it because the order of the docs returned is not guaranteed by the order of the keys parameter.
      result.rows = page.map(id => result.rows.find(row => row.id === id))
    } else {
      // result = await db.query(
      //   'search',
      //   { 
      //     startkey: `${phrase}`.toLocaleLowerCase(),
      //     endkey: `${phrase}\uffff`.toLocaleLowerCase(),
      //     include_docs: true,
      //     limit,
      //     skip
      //   }
      // )
      let currentSearchArraySize = 0
      for (let i = 0; i < indexArray.length; i++) {
        const index = indexArray[i]
        const results = index.search(phrase, limit)
        results.forEach(result => {
          if (currentSearchArraySize <= limit) {
            const resultArray = result.split('_')
            indexSet.add(resultArray[0])
            currentSearchArraySize++
          }
        })
      }
    }
    const indexResults = Array.from(indexSet)
    if (indexResults.length > 0) {
      this.indexingMessage$.next({
        message: indexResults.length + ' Index results.'
      })
    }
    
    // return indexResults
    result = await db.allDocs(
      { 
        keys: indexResults,
        include_docs: true
      }
    )
    this.indexingMessage$.next({
      message: result?.rows?.length + ' results from DB.'
    })
    const searchResults = result.rows.map(row => {
      if (row.error !== 'not_found') {
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
      }
    })
    // Remove undefined elements
    const filteredSearchResults = searchResults.filter(function (el) {
      return el != null;
    });
    this.indexingMessage$.next({
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
    let index = new Index({tokenize: "full"})
    let add = async (id, seq, content) => {
      if (indexes[seq]) {
        await index.addAsync(id, content);
        console.log("Added: " + id + ":" + content + " to seq: " + seq)
      } else {
        const previousSeq = seq - 1
        if (previousSeq > 0) {
          // export previous index
          let time = new Date().toISOString()
          let message = time + ' : About to save index ' + previousSeq;
          console.log(message)
          await this.exportSearchIndex(groupId, index, previousSeq);
          time = new Date().toISOString()
          message = time + ' : Saved index ' + previousSeq;
          console.log(message)
        }
        // Create a new index
        indexes[seq] = true
        index = new Index({tokenize: "full"})
        await index.addAsync(id, content);
        console.log("Added: " + id + ":" + content + " to new seq: " + seq)
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
          // this.searchMessage$.next({
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
                      
                      const content = JSON.stringify(searchResult)
                      
                      cnt++
                      if (cnt > this.indexItemSize) {
                        seq++
                        cnt = 0
                      }
                      await add(key, seq, content)
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

  async exportSearchIndex(groupId: string, index, seq: number) {
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

      await index.export(function (key, data) {
        return new Promise(async function (resolve) {
          // do the saving as async
          // const fileEntry:FileEntry = await new Promise(resolve => {
          //   const fileEntry = indexesDirEntry.getFile(key, {create: true})
          //   resolve(fileEntry)
          // });
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
          })
          resolve()
        })
      })
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
        const index = new Index({tokenize: "full"});
        const seq = indexSequences[i]
        // const fileName = entry.name
        
        // let key = fileName
        // const fileNameArray = fileName.split('.')
        // if (fileNameArray[2] === 'map') {
        //   key = 'map'
        // }
        // const key = fileNameArray[0]
        // const indexExists = indexes.find(index => index === key)
        // if (!indexExists) {
        //   console.log("Found index: " + key)
        //   indexes.push(key)
        // }

        let key = 'map'
        let fileName = 'reg.cfg.map-' + seq
        const mapFile:string = await this.getFile(indexesDirEntry, fileName);
        index.import(key, mapFile)
        console.log("Index loaded the file " + fileName)
        key = 'reg'
        fileName = 'reg-' + seq
        const registerFile:string = await this.getFile(indexesDirEntry, fileName);
        index.import(key, registerFile)
        console.log("Index loaded the file " + fileName)
        indexes.push(index)
        this.indexingMessage$.next({
          message: ' Loaded index ' + i
        })
      }
      return indexes
    }
  }

  private async getFile(indexesDirEntry: DirectoryEntry, fileName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const fileEntry = await new Promise(resolve => {
          (indexesDirEntry as DirectoryEntry).getFile(fileName, {create: false, exclusive: false}, resolve);
        }
      );
      const file: File = await new Promise(resolve => {
        (fileEntry as FileEntry).file(resolve)
      });
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
    })
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

}

