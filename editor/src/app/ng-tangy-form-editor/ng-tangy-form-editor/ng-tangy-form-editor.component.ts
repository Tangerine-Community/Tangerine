import { ServerConfigService } from './../../shared/_services/server-config.service';
import { AfterContentInit, OnInit, ElementRef, Component, ViewChild, Inject, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTabChangeEvent } from "@angular/material/tabs";
import {AppConfigService} from "../../shared/_services/app-config.service";
import {FormMetadata} from "../feedback-editor/form-metadata";
import {Feedback} from "../feedback-editor/feedback";

@Component({
  selector: 'app-ng-tangy-form-editor',
  templateUrl: './ng-tangy-form-editor.component.html',
  styleUrls: ['./ng-tangy-form-editor.component.css']
})
export class NgTangyFormEditorComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('header', {static: true}) header: ElementRef;
  containerEl: any;
  selectedIndex = 0;
  print = false;
  groupId;
  formId;
  groupName;
  form:FormMetadata;
  feedback:Feedback;
  modules:any;
  hasClassModule = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private serverConfigService:ServerConfigService
  ) { }

  async ngOnInit() {

    this.containerEl = this.container.nativeElement

    this.formId = this.route.snapshot.paramMap.get('formId');
    this.print = !!this.route.snapshot.paramMap.get('print');

    let pathArray = window.location.hash.split( '/' );
    this.groupId = pathArray[2];
    let groupName = this.groupId;
    this.groupName = groupName;
    let formJson = <any>await this.http.get(`./assets/forms.json`).toPromise()
    const formSrc = formJson.find(formInfo => formInfo.id === this.formId).src
    let formHtml = await this.http.get(formSrc, {responseType: 'text'}).toPromise()

    const serverConfig = await this.serverConfigService.getServerConfig()
    const appConfig = await this.appConfigService.getAppConfig(groupName);
    const appConfigCategories = appConfig.categories;
    const enabledModules = serverConfig.enabledModules;
    if (enabledModules && !!(enabledModules.find(module=>module==='class'))) {
      this.hasClassModule = true;
    }
    const categories = JSON.stringify(appConfigCategories);


    // Categories is an string of an array: categories ='["one","two","three","four"]'>
    if (!this.print) {
      this.containerEl.innerHTML = `
        <tangy-form-editor style="margin:15px" categories='${categories}' files-endpoint="./media-list" ${serverConfig.hideSkipIf ? 'hide-skip-if':''}>
          <template>
            ${formHtml}
          </template>
        </tangy-form-editor>
      `;
      const tangyFormEditorEl = this.containerEl.querySelector('tangy-form-editor');
      tangyFormEditorEl.store.subscribe(_ => this.saveForm(tangyFormEditorEl.formHtml));
    } else {
      this.containerEl.innerHTML = `
        <style>
        .tangy-main-container {
          left : 0px;
          position:relative !important
        }
        mat-toolbar, mat-tab-header {
          display:none !important;
        }
        </style>
        <tangy-form-editor style="margin:15px" categories ='${categories}' print>
          <template>
            ${formHtml}
          </template>
        </tangy-form-editor>
      `
    }
  }

  async saveForm(formHtml) {
    let files = []
    let state = this.containerEl.querySelector('tangy-form-editor').store.getState()
    // Update forms.json.
    let formsJson = await this.http.get<Array<any>>(`/editor/${this.groupId}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== state.form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, {
        title: state.form.title
      })
    })
    files.push({
      groupId: this.groupId,
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    })
    // Update form.html.
    files.push({
      groupId: this.groupId,
      filePath:`./${state.form.id}/form.html`,
      fileContents: formHtml
    })
    // Send to server.
    let errorDetected = false
    for (let file of files) {
      try {
        await this.http.post('/editor/file/save', file).toPromise()
      } catch (e) {
        console.log(e)
        errorDetected = true
        //alert("Your form was not successfully saved. Please try again.")
      }
    }
    if (!errorDetected) {
      //alert("Your form was successfully saved.")
    } else {
      //alert("Your form was not successfully saved. Please try again.")
    }
  }

}

