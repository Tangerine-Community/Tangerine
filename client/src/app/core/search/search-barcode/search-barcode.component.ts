import { Component, OnInit, ViewChild, ElementRef, Output } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { EventEmitter } from 'events';

const STATE_INITIAL = 'STATE_INITIAL'
const STATE_READY = 'STATE_READY'
const STATE_SCANNING = 'STATE_SCANNING'
const STATE_SUCCESS = 'STATE_SUCCESS'
const STATE_ERROR = 'STATE_ERROR'

@Component({
  selector: 'app-search-barcode',
  templateUrl: './search-barcode.component.html',
  styleUrls: ['./search-barcode.component.css']
})
export class SearchBarcodeComponent implements OnInit {

  @Output('change') 
  public change = new EventEmitter()
  @Output('error') 
  public error = new EventEmitter()
  @Output('cancel')
  public cancel = new EventEmitter()
  public value = ''
  public state =  STATE_INITIAL

  @ViewChild('scanner') 
  private scanner: ElementRef
  private barcodeSearchMapFunction = 'return data'

  constructor(
    private appConfig:AppConfigService
  ) { }

  async ngOnInit() {
    const appConfig = await this.appConfig.getAppConfig()
    this.barcodeSearchMapFunction = appConfig.barcodeSearchMapFunction
      ? appConfig.barcodeSearchMapFunction
      : this.barcodeSearchMapFunction
    this.scanner.nativeElement.addEventListener('change', (event) => {
      event.stopPropagation()
      this.onScan(event.target.value)
    })
    this.scanner.nativeElement.addEventListener('cancel', (event) => {
      event.stopPropagation()
      this.onCancel()
    })
    this.state = STATE_READY
  }

  public startScanning() {
    this.state = STATE_SCANNING
    this.scanner.nativeElement.startScanning()
  }

  private onScan(data) {
    try {
      this.value = eval(`(() => {${this.barcodeSearchMapFunction}})()`)
      this.state = STATE_SUCCESS
      this.change.emit('change')
    } catch(e) {
      this.state = STATE_ERROR
      this.error.emit('error')
      console.log(e)
    }
  }

  private onCancel() {
    this.state = STATE_READY
    this.cancel.emit('cancel')
  }
  


}
