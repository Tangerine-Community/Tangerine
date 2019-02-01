import {Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTable} from "@angular/material";
import {FormMetadata} from "./form-metadata";
import {Feedback} from "./feedback";
import {FeedbackService} from "./feedback.service";
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";


@Component({
  selector: 'app-form-json-editor',
  templateUrl: './form-json-editor.component.html',
  styleUrls: ['./form-json-editor.component.css']
})
export class FormJsonEditorComponent implements OnInit {

  showFeedbackForm = false;
  groupName:string
  formId:string
  feedbackItems:Array<Feedback> = []
  feedback:Feedback
  percentile:number
  example:string;
  skill:string;
  assignment:string;
  message:string
  formItems:any
  formItem:string
  formItemName:string
  // displayedColumns: string[] = ['formItemName','percentile', 'example', 'skill', 'assignment', 'message'];
  displayedColumns: string[] = ['operations','formItemName','percentile', 'example'];
  dataSource
  showFeedbackListing = true

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
    public dialogRef: MatDialogRef<FormJsonEditorComponent>,
    public feedbackService:FeedbackService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: FormMetadata,
    private http: HttpClient) {}

  async ngOnInit() {
    console.log("I'm here now babe.")
    this.feedback = this.getFeedback()
    this.groupName = this.data['groupName'];
    this.formId = this.data['id'];
    let formHtml = await this.http.get(`/editor/${this.groupName}/content/${this.formId}/form.html`, {responseType: 'text'}).toPromise()
    this.formItems = await this.feedbackService.createFormItemsList(formHtml);
    await this.getFeedbackList(null);
  }

  private async getFeedbackList(form: FormMetadata) {
    if (!form)
      form = await this.feedbackService.getForm(this.groupName, this.formId)
    if (form.feedbackItems) {
      let denormed = form.feedbackItems.map(fb => {
        let formItem = this.formItems.find(item => item.id === fb['formItem'])
        fb.formItemName = formItem.title
        return fb
      });
      this.feedbackItems = denormed
    }
    // console.log("feedbackItems: " + JSON.stringify(this.feedbackItems))
    this.dataSource = this.feedbackItems
    if (this.feedbackItems.length === 0) {
      this.showFeedbackListing = false
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async showAddFeedbackForm() {
    await this.getFeedbackList(null)
    this.showFeedbackForm = true
    this.showFeedbackListing = false
  }

  getFeedback() {
    // this.feedbackService.getFeedback().subscribe(feedback => this.feedback = feedback);
    return this.feedbackService.getFeedback()
  }

  save(): void {
    this.feedback.percentile = this.percentile
    this.feedback.example = this.example
    this.feedback.skill = this.skill
    this.feedback.assignment = this.assignment
    this.feedback.message = this.message
    this.feedback.formItem = this.formItem
    this.feedbackService.update(this.groupName, this.formId, this.feedback)
    .then(async (data) => {
      // console.log(data)
      await this.getFeedbackList(data)
      this.showFeedbackForm = false
      this.showFeedbackListing = true
      // this.table.renderRows();
      // this.dialogRef.close();
    });
      // .subscribe(
      //   data => {
      //     console.log("data: " + JSON.stringify(data))
      //   });
  }

  editFeedback(groupName:string, formId:string,  formItem: string, percentile:number) {
    this.feedbackService.edit(this.groupName, this.formId, formItem, percentile)
      .then(async (data) => {
        console.log(data)
        this.feedback = data
        this.percentile = this.feedback.percentile
        this.example = this.feedback.example
        this.skill = this.feedback.skill
        this.assignment = this.feedback.assignment
        this.message = this.feedback.message
        this.formItem = this.feedback.formItem

        this.showFeedbackForm = true
        this.showFeedbackListing = false
      });
  }

  deleteFeedback(groupName:string, formId:string,  formItem: string, percentile:number) {
    const confirmDeletion = confirm("Delete this feedback?");
    if (confirmDeletion) {
      this.feedbackService.delete(this.groupName, this.formId, formItem, percentile)
        .then(async (data) => {
          // console.log(data)
          await this.getFeedbackList(data)
          this.table.renderRows();
        });
    }
  }

  ngAfterViewInit() {
    console.log('Values on ngAfterViewInit():');
    if (this.table) {
      console.log("I'm here.")
    }
  }

}

