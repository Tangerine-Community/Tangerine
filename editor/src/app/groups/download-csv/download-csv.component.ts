import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import {Component, OnInit, OnDestroy} from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-download-csv',
  templateUrl: './download-csv.component.html',
  styleUrls: ['./download-csv.component.css']
})
export class DownloadCsvComponent implements OnInit, OnDestroy {

  title = _TRANSLATE('Download CSV')
  breadcrumbs:Array<Breadcrumb> = []

  months = [];
  years = [];
  selectedMonth = '*';
  selectedYear = '*';
  processing = false;
  stateUrl;
  downloadUrl;
  groupName;
  formId;
  isDownloadComplete;
  errorDownloadingFile;
  result;
  checkDownloadStatusInterval;
  nothingToDownload = false;
  excludePII = false;

  constructor(
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private formsService: TangerineFormsService
  ) { }

  async ngOnInit() {

    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i<10; i++) {
      this.years = [new Date().getFullYear()-i, ...this.years]
    }
    this.years = this.years.reverse()
    this.route.params.subscribe(async params => {
      this.groupName = params['groupName'];
      this.formId = params['formId'];
      const formInfo = (await this.formsService.getFormsInfo(this.groupName))
        .find(formInfo => formInfo.id === this.formId)
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Download CSV'),
          url: 'download-csv'
        },
        <Breadcrumb>{
          label: formInfo.title,
          url: `download-csv/${formInfo.id}`
        }
      ]
    });
  }

  async process() {
    if ((this.selectedMonth === '*' && this.selectedYear !== '*') || (this.selectedMonth !== '*' && this.selectedYear === '*')) {
      alert('You must choose a month and a year.')
      return
    }
    this.processing = true
    try {
      const result: any = await this.groupsService.downloadCSV(this.groupName, this.formId, this.selectedYear, this.selectedMonth, this.excludePII);
      this.stateUrl = result.stateUrl;
      this.downloadUrl = result.downloadUrl;
      // TODO call download status immediately then after every few second, Probably use RXJS to ensure we only use the latest values
      this.checkDownloadStatusInterval = setInterval(async () => { await this.checkDownloadStatus(); }, 5000);
    } catch (error) {
      console.log(error);
    }
  }

  async checkDownloadStatus() {
    try {
      this.result = await this.groupsService.checkCSVDownloadStatus(this.stateUrl);
      this.isDownloadComplete = this.result.complete;
      if (this.isDownloadComplete) {
        clearInterval(this.checkDownloadStatusInterval)
        if (!this.result.skip) {
          this.nothingToDownload = true;
        }
      }
    } catch (error) {
      this.errorDownloadingFile = true;
      console.log(error);
    }
  }

  ngOnDestroy(){
    clearInterval(this.checkDownloadStatusInterval)
  }
  
}
