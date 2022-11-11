import {environment} from '../../environments/environment'
import {FormInfo, FormTemplate} from 'src/app/tangy-forms/classes/form-info.class'
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import {Subject} from 'rxjs'
import {TangyFormsInfoService} from 'src/app/tangy-forms/tangy-forms-info-service'
import {Component, ViewChild, ElementRef, Input, OnInit} from '@angular/core'
import {_TRANSLATE} from '../shared/translation-marker'
import {TangyFormService} from '../tangy-forms/tangy-form.service'
import {AppConfigService} from '../shared/_services/app-config.service'
import {VariableService} from '../shared/_services/variable.service'

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-class-forms-player',
  templateUrl: './class-forms-player.component.html',
  styleUrls: ['../tangy-forms/tangy-forms-player/tangy-forms-player.component.css']
})
export class ClassFormsPlayerComponent implements OnInit {

  @Input('response') response: TangyFormResponseModel
  @Input('formHtml') formHtml: string
  @ViewChild('container', {static: true}) container: ElementRef
  $afterSubmit = new Subject()
  rendered = false
  window: any
  appConfig: any
  mediaFilesDir: string
  mediaFilesDirEntry
  browserMediaFilesDirHandle  // PWA's

  constructor(
    private tangyFormsInfoService: TangyFormsInfoService,
    private tangyFormService: TangyFormService,
    private appConfigService: AppConfigService,
    private variableService: VariableService
  ) {
    this.window = window
  }

  async ngOnInit() {
    this.appConfig = await this.appConfigService.getAppConfig()
    const groupId = this.appConfig.groupId
    if (this.window.isCordovaApp) {
      this.mediaFilesDir = cordova.file.externalRootDirectory + 'Documents/Tangerine/media/' + groupId + '/'
    }

    // Sadly, there are 2 file access API's used - one for Cordova, the other, File System Access API for PWA's
    if (this.window.isCordovaApp) {
      const entry = await new Promise<Entry>((resolve, reject) => {
        this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, resolve, reject)
      })
      // We know this path is a directory
      const directory = entry as DirectoryEntry
      await new Promise((resolve, reject) => {
        directory.getDirectory('Documents', {create: true}, (dirEntry) => {
          dirEntry.getDirectory('Tangerine', {create: true}, (dirEntry) => {
            dirEntry.getDirectory('media', {create: true}, (dirEntry) => {
              dirEntry.getDirectory(groupId, {create: true}, resolve, reject)
            }, this.onErrorGetDir)
          }, this.onErrorGetDir)
        })
      })
    } else {
      try {
        const browserMediaFilesDirPicked = await this.variableService.get('media-directory-dir-picked')
        if (browserMediaFilesDirPicked) {
          this.browserMediaFilesDirHandle = await this.variableService.get('media-directory-dir-handle')
          const msg = `Retrieved media-directory handle "${this.browserMediaFilesDirHandle.name}" from variableService.`
          console.log('msg: ' + msg)
        } else {
          const directoryHandle = await this.window.showDirectoryPicker()
          await this.variableService.set('media-directory', directoryHandle)
          this.browserMediaFilesDirHandle = directoryHandle
          const msg = `Stored directory handle for "${directoryHandle.name}" in variableService.`
          console.log(msg)
        }
      } catch (error) {
        // alert(error.name, error.message);
        console.log('error: ' + error)
      }
    }
  }

  async render() {
    // Get form ingredients.
    const formResponse = this.response
      ? new TangyFormResponseModel(this.response)
      : undefined
    const container = this.container.nativeElement
    container.innerHTML = this.formHtml
    const formEl = container.querySelector('tangy-form')
    const itemId = formEl.querySelector('tangy-form-item').getAttribute('id')
    if (formResponse && formResponse.items.find(item => item.id === itemId)) {
      formEl.response = {
        ...formResponse,
        items: formResponse.items.filter(item => item.id === itemId)
      }
    } else if (formResponse) {
      formResponse.items = [{
        id: itemId,
        inputs: []
      }]
      formEl.response = formResponse
    } else {
      formEl.newResponse()
    }
    if (!this.response) {
      this.response = formEl.response
    }
    formEl.addEventListener('TANGY_MEDIA_UPDATE', async _ => {
      // _.preventDefault()
      // Always save TANGY-VIDEO-CAPTURE to file; probably would be better to create a property for the input
      // to declare 'always save as file'
      if (!this.response) {
        this.response = formEl.response
      }
      if (_.target.tagName === 'TANGY-VIDEO-CAPTURE' || (this.appConfig.mediaFileStorageLocation && this.appConfig.mediaFileStorageLocation === 'file') || !this.window.isCordovaApp) {
        
        let filename = _.target.name + '_' + this.response?._id
        const domString = _.target.value
        console.log('Caught TANGY_MEDIA_UPDATE event at: ' + filename)

        // if (this.window.isCordovaApp) {
        async function getBlob() {
          return new Promise((resolve, reject) => {
            function reqListener() {
              if (!this.response) {
                this.response = formEl.response
              }
              console.log(`this.response type: ${this.response?.type} size: ${this.response?.size} `)
              let extension
              if (this.response.type === 'image/jpeg') {
                extension = '.jpg'
              } else if (this.response.type === 'image/png') {
                extension = '.png'
              } else if (this.response.type === 'audio/mpeg') {
                extension = '.mp3'
              } else if (this.response.type === 'video/mp4') {
                extension = '.mp4'
              } else if (this.response.type === 'text/csv') {
                extension = '.csv'
              } else if (this.response.type === 'application/pdf') {
                extension = '.pdf'
              } else if (this.response.type === 'application/msword') {
                extension = '.doc'
              } else if (this.response.type === 'application/vnd.ms-excel') {
                extension = '.xls'
              } else if (this.response.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                extension = '.xlsx'
              } else if (this.response.type === 'application/zip') {
                extension = '.zip'
              } else if (this.response.type === 'application/json') {
                extension = '.json'
              } else if (this.response.type === 'application/xml') {
                extension = '.xml'
              } else if (this.response.type === 'image/svg+xml') {
                extension = '.svg'
              } else if (this.response.type === 'audio/wav') {
                extension = '.wav'
              } else if (this.response.type === 'video/webm') {
                extension = '.webm'
              } else if (this.response.type === 'audio/webm') {
                extension = '.weba'
              }
              filename = filename + extension
              resolve(this.response)
            }

            const xhr = new XMLHttpRequest()
            xhr.open('GET', domString, true)
            xhr.addEventListener('load', reqListener)
            xhr.responseType = 'blob'
            xhr.send()
          })
        }

        const blob = await getBlob()

        if (this.window.isCordovaApp) {
          try {
            this.mediaFilesDirEntry = await new Promise((resolve, reject) =>
              this.window.resolveLocalFileSystemURL(this.mediaFilesDir, resolve, reject)
            )
          } catch (e) {
            const message = 'Unable to access ' + this.mediaFilesDir + ' Error: ' + JSON.stringify(e)
            console.error(message)
            alert(message)
          }

          if (this.mediaFilesDirEntry) {
            this.mediaFilesDirEntry.getFile(filename, {create: true, exclusive: false}, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = (data) => {
                  console.log(`Media file stored at ${this.mediaFilesDir}${filename}`)
                }
                fileWriter.onerror = (e) => {
                  alert(`${_TRANSLATE('Write Failed')}` + e.toString())
                }
                fileWriter.write(blob)
              })
            }, (error) => {
              alert('Error: ' + error)
              console.error(error)
            })
          }
        } else {
          if (this.browserMediaFilesDirHandle) {
            const newFileHandle = await this.browserMediaFilesDirHandle.getFileHandle(filename, { create: true })
            const path = await this.browserMediaFilesDirHandle.resolve(newFileHandle)
            console.log(`Media file stored at ${path}`)
          }
        }
      } else {
        console.log('Saving media files to database.')
        _.preventDefault()
      }
    }, true)
    formEl.addEventListener('after-submit', async (event) => {
      this.$afterSubmit.next(formEl.response)
    })
    this.rendered = true
  }

  onErrorGetDir(e) {
    console.log('Error: ' + e)
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = 'File or directory not found.'
    } else {
      errorMessage = e
    }
    const message = `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
    console.log(message)
  }

}
