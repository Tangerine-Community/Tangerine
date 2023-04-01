import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTable } from "@angular/material/table";
import {FormMetadata} from "./form-metadata";
import {Feedback} from "./feedback";
import {FeedbackService} from "./feedback.service";
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";


@Component({
  selector: 'feedback-editor',
  templateUrl: './feedback-editor.component.html',
  styleUrls: ['./feedback-editor.component.css']
})
export class FeedbackEditorComponent implements OnInit {

  showFeedbackForm = false;
  @Input() groupName:string
  @Input() formId:string
  feedbackItems:Array<Feedback> = []
  feedback:Feedback
  percentile:number
  example:string = ""
  skill:string = ""
  assignment:string = ""
  message:string = ""
  formItems:any
  formItem:string
  formItemName:string
  displayedColumns: string[] = ['operations','formItemName','percentile', 'example'];
  dataSource
  showFeedbackListing = true
  percentileOptions:any = []

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;

  constructor(
    public feedbackService:FeedbackService,
    private route: ActivatedRoute,
    public data: FormMetadata,
    private http: HttpClient ) {}

  async ngOnInit() {
    this.feedback = this.getFeedback()
    let formHtml = await this.http.get(`/editor/${this.groupName}/content/${this.formId}/form.html`, {responseType: 'text'}).toPromise()
    this.formItems = await this.feedbackService.createFormItemsList(formHtml);
    this.percentileOptions = this.createPercentileOptions(null)
    await this.getFeedbackList(null);
  }

  dynamicSortMultiple(...argu) {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = argu;
    return function (obj1, obj2) {

      function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a,b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
        }
      }

      var i = 0, result = 0, numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while(result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }

  private async getFeedbackList(form: FormMetadata) {
    if (!form)
      form = await this.feedbackService.getForm(this.groupName, this.formId)
    if (form.feedbackItems) {
      let denormed = form.feedbackItems.map(fb => {
        let formItem = this.formItems.find(item => item.id === fb['formItem'])
        fb.formItemName = formItem.title
        fb.messageTruncated = fb.message.substring(0,30)
        fb.exampleTruncated = fb.example.substring(0,30)

        let percentileOption = this.createPercentileOptions(null).find(item => item.id === String(fb['percentile']))
        if (percentileOption) {
          fb.percentileTitle = percentileOption.title
        }
        return fb
      });
      // ORDER_BY formItem, percentile
      this.feedbackItems = denormed.sort(this.dynamicSortMultiple("formItem", "percentile"));
    }
    // console.log("feedbackItems: " + JSON.stringify(this.feedbackItems))
    this.dataSource = this.feedbackItems
    if (this.feedbackItems.length === 0) {
      this.showFeedbackListing = false
    }
  }

  onNoClick(): void {
    // this.dialogRef.close();
    this.showFeedbackForm = false
    this.showFeedbackListing = true
  }

  async showAddFeedbackForm() {
    await this.getFeedbackList(null)
    // this.feedback = {}
    this.percentile = null
    this.example = ""
    this.skill = ""
    this.assignment = ""
    this.message = ""
    this.formItem = ""

    this.showFeedbackForm = true
    this.showFeedbackListing = false
  }

  getFeedback() {
    // this.feedbackService.getFeedback().subscribe(feedback => this.feedback = feedback);
    return this.feedbackService.getFeedback()
  }

  save(): void {
    if (this.percentile !== null && this.formItem !== null) {
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
    } else {
      alert("Please select a Subtask and a Percentile.")
    }
  }

  editFeedback(groupName:string, formId:string,  formItem: string, percentile:number) {
    this.feedbackService.edit(this.groupName, this.formId, formItem, percentile)
      .then(async (data) => {
        this.feedback = data
        this.percentile = this.feedback.percentile
        this.example = this.feedback.example
        this.skill = this.feedback.skill
        this.assignment = this.feedback.assignment
        this.message = this.feedback.message
        this.formItem = this.feedback.formItem

        this.percentileOptions = this.createPercentileOptions(null)

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

  changeFormItem(value) {
    let feedbackItemsForForm:Array<Feedback> = this.feedbackItems.filter(item => item.formItem === this.formItem)
    if (feedbackItemsForForm) {
      let percentagesUsed = feedbackItemsForForm.map(feedback => parseInt(String(feedback.percentile)))
      let percentiles = [0,1,2,3,4]
      let intersection = percentiles.filter(x => !percentagesUsed.includes(x));
      this.percentileOptions = this.createPercentileOptions(intersection).filter(function(e){return e});
    }
  }

  createPercentileOptions(optionsToDisplay:Array<number>) {
    let percentileOptions:Array<any> = [
      {"id":"0", "title": "0% - 19%"},
      {"id":"1", "title": "20% - 39%"},
      {"id":"2", "title": "40% - 59%"},
      {"id":"3", "title": "60% - 79%"},
      {"id":"4", "title": "80% - 100%"}
    ]

    if (optionsToDisplay) {
      let filtered:Array<any> = optionsToDisplay.map(percentile => {
        return percentileOptions.find(option => parseInt(option.id) === percentile)
      })
      return filtered
    } else {
      return percentileOptions
    }
  }

  // ngAfterViewInit() {
  //   console.log("things changed")
  //   if (this.table) {
  //     console.log("table says, 'I'm here.'")
  //   }
  // }

}

