import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchDoc, SearchService } from 'src/app/shared/_services/search.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { SearchBarcodeComponent } from './search-barcode/search-barcode.component';
import { t } from 'tangy-form/util/t.js'
import { v4 as UUID } from 'uuid';
import { Index, Document, Worker } from 'flexsearch'
import {AppConfigService} from "../../shared/_services/app-config.service";
import {_TRANSLATE} from "../../shared/translation-marker";

// @TODO Turn this into a service that gets this info from a hook.
export const FORM_TYPES_INFO = [
  {
    id: 'form',
    newFormResponseLinkTemplate: '/tangy-forms-player/${formId}',
    resumeFormResponseLinkTemplate: '/tangy-forms-player?formId=${formId}&responseId=${searchDoc._id}',
    iconTemplate: '${searchDoc && searchDoc.variables.complete ? `assignment-turned-in` : `assignment`}'
  },
  {
    id: 'case',
    newFormResponseLinkTemplate: '/case-new/${formId}',
    resumeFormResponseLinkTemplate: '/case/${searchDoc._id}',
    iconTemplate: '${searchDoc && searchDoc.variables.complete ? `folder-special` : `folder`}'
  }
]

class Queue {

  activeTicket:string

  getTicket() {
    const ticket = UUID()
    this.activeTicket = ticket
    return ticket
  }

}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchBar', {static: true}) searchBar: ElementRef
  @ViewChild('searchResults', {static: true}) searchResults: ElementRef
  @ViewChild('scanner', {static: true}) scanner: SearchBarcodeComponent
  onSearch$ = new Subject()
  didSearch$ = new Subject()
  searchReady$ = new Subject()
  navigatingTo$ = new Subject()
  searchDocs:Array<SearchDoc> = []
  username:string
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>
  showScan = false
  moreClickCount = 0
  searchString = ''
  resultsPerPage = 10
  thereIsMore = true 
  isLoading = true 
  searchQueue:Queue = new Queue()
  index
  window: any;
  indexFilesToSync: boolean;
  
  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private formsInfoService: TangyFormsInfoService,
    private router: Router,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }
  
  
  async ngOnInit() {
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.username = this.userService.getCurrentUser()
    this.formTypesInfo = FORM_TYPES_INFO
    // const worker = new Worker(options);
    this.onSearch$
      .pipe(debounceTime(4*1000))
      .subscribe((searchString:string) => {
        this.searchResults.nativeElement.innerHTML = 'Searching...'
        this.onSearch(searchString)
      })
    this
      .searchBar
      .nativeElement
      .addEventListener('keyup', event => {
        this.isLoading = true
        this.searchResults.nativeElement.innerHTML = ``
        this.onSearch$.next(event.target.value)
      })
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.searchReady$.next(true)
    this.onSearch('')
  }

  async loadMore() {
    const ticket = this.searchQueue.getTicket()
    this.isLoading = true
    this.moreClickCount++
    this.searchDocs = await this.searchService.search(this.username, this.searchString, this.resultsPerPage, this.resultsPerPage * this.moreClickCount)
    let searchResultsMarkup = ``
    if (this.searchDocs.length < this.resultsPerPage) {
      this.thereIsMore = false
    }
    for (const searchDoc of this.searchDocs) {
      searchResultsMarkup += this.templateSearchResult(searchDoc) 
    }
    const el = document.createElement('div')
    el.innerHTML = searchResultsMarkup 
    if (ticket !== this.searchQueue.activeTicket) return
    this.searchResults.nativeElement.append(el)
    this.isLoading = false
    this.didSearch$.next(true)   
  }

  async onSearch(searchString:string) {
    const ticket = this.searchQueue.getTicket()
    this.moreClickCount = 0
    this.thereIsMore = true 
    this.searchString = searchString
    this.searchResults.nativeElement.innerHTML = ""
    this.searchDocs = await this.searchService.search(this.username, searchString, this.resultsPerPage, 0)
    if (ticket !== this.searchQueue.activeTicket) return
    this.searchResults.nativeElement.innerHTML = ""
    if (ticket !== this.searchQueue.activeTicket) return
    let searchResultsMarkup = ``
    if (ticket !== this.searchQueue.activeTicket) return
    if (this.searchDocs.length === 0) {
      searchResultsMarkup = `
        <span style="padding: 25px">
          ${t('No results.')}
        </span>
      `
      this.thereIsMore = false
    }
    if (ticket !== this.searchQueue.activeTicket) return
    if (this.searchDocs.length < this.resultsPerPage) {
      this.thereIsMore = false
    }
    if (ticket !== this.searchQueue.activeTicket) return
    for (const searchDoc of this.searchDocs) {
      searchResultsMarkup += this.templateSearchResult(searchDoc) 
    }
    if (ticket !== this.searchQueue.activeTicket) return
    this.searchResults.nativeElement.innerHTML = searchResultsMarkup
    if (ticket !== this.searchQueue.activeTicket) return
    this.isLoading = false
    this.didSearch$.next(true)
  }

  templateSearchResult(searchDoc) {
    const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
    const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
    const formId = formInfo.id
    return `
      <div class="icon-list-item search-result" open-link="${eval(`\`${formTypeInfo.resumeFormResponseLinkTemplate}\``)}">
        <mwc-icon slot="item-icon">${eval(`\`${formTypeInfo.iconTemplate}\``)}</mwc-icon>
        <div>
          <div> ${eval(`\`${formInfo.searchSettings.primaryTemplate ? formInfo.searchSettings.primaryTemplate : searchDoc._id}\``)}</div>
          <div secondary>
          ${eval(`\`${formInfo.searchSettings.secondaryTemplate ? formInfo.searchSettings.secondaryTemplate : formInfo.title}\``)}
          </div>
        </div>
      </div>
    `
  }

  scan() {
    this.showScan = true
    this.scanner.startScanning()
  }

  onSearchResultClick(element) {
    let parentEl = undefined
    let currentEl = element
    while (!parentEl) {
      if (currentEl.hasAttribute('open-link')) {
        parentEl = currentEl
      } else {
        currentEl = currentEl.parentElement
      }
    }
    this.goTo(currentEl.getAttribute('open-link'))
  }

  focusOnFind() {
    this
      .searchBar
      .nativeElement
      .focus()
  }

  goTo(url) {
    this.navigatingTo$.next(url)
    this.router.navigateByUrl(url)
  }

  onScanChange(scanSearchString) {
      this.showScan = false
      this.onSearch(scanSearchString)
      this.searchBar.nativeElement.value = scanSearchString
  }

  onScanError() {

  }

  onScanCancel() {
    this.showScan = false

  }

  async updateSearchIndex() {
    const index = await this.searchService.indexDocs()
    const appConfig = await this.appConfigService.getAppConfig()
    const groupId = appConfig.groupId
    let indexesDir, indexesDirEntry
    // this.index = index

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
      
      await index.export(function (key, data) {
        return new Promise(async function (resolve) {
          // do the saving as async
          // const fileEntry:FileEntry = await new Promise(resolve => {
          //   const fileEntry = indexesDirEntry.getFile(key, {create: true})
          //   resolve(fileEntry)
          // });
          indexesDirEntry.getFile(key, {create: true}, (fileEntry) => {
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = (data) => {
                console.log(`Index stored at ${groupId}/${key}`)
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
    const index = new Index({tokenize: "full"});

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

      if (indexDirEntries.length > 0) {
        this.indexFilesToSync = true
      }
      const indexes = []
      for (let i = 0; i < indexDirEntries.length; i++) {
        const entry = indexDirEntries[i]
        const fileName = entry.name
        let key = fileName
        const fileNameArray = fileName.split('.')
        if (fileNameArray[2] === 'map') {
          key = 'map'
        }
          // const key = fileNameArray[0]
        // const indexExists = indexes.find(index => index === key)
        // if (!indexExists) {
        //   console.log("Found index: " + key)
        //   indexes.push(key)
        // }
        
        const fileEntry = await new Promise(resolve => {
            (indexesDirEntry as DirectoryEntry).getFile(fileName, {create: true, exclusive: false}, resolve);
          }
        );
        const file: File = await new Promise(resolve => {
          (fileEntry as FileEntry).file(resolve)
        });
        let reader = this.getFileReader();
        reader.onloadend = function() {
          console.log("Successful file read: " + this.result)
          // displayFileData(fileEntry.fullPath + ": " + this.result);
          index.import(key, this.result)
          console.log("Index loaded the file " + fileName)
        }
        reader.readAsText(file);
      }
      
    }
    
    
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }
}
