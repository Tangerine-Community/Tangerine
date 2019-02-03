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
  example:string = ""
  skill:string = ""
  assignment:string = ""
  message:string = ""
  formItems:any
  formItem:string
  formItemName:string
  // displayedColumns: string[] = ['formItemName','percentile', 'example', 'skill', 'assignment', 'message'];
  displayedColumns: string[] = ['operations','formItemName','percentile', 'example'];
  dataSource
  showFeedbackListing = true
  percentileOptions:any = []

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
    console.log("changeFormItem: " + this.formItem + " value: " + value)
    let feedbackItemsForForm:Array<Feedback> = this.feedbackItems.filter(item => item.formItem === this.formItem)
    if (feedbackItemsForForm) {
      let percentagesUsed = feedbackItemsForForm.map(feedback => parseInt(String(feedback.percentile)))
      let percentiles = [1,2,3,4,5]
      let intersection = percentiles.filter(x => !percentagesUsed.includes(x));
      // console.log("These are available for this form: " + JSON.stringify(intersection))
      this.percentileOptions = this.createPercentileOptions(intersection).filter(function(e){return e});
      // console.log("These are this.options for this form: " + JSON.stringify(this.percentileOptions))
    }
  }

  createPercentileOptions(optionsToDisplay:Array<number>) {
    let percentileOptions = [
      {"id":"1", "title": "0% - 20%"},
      {"id":"2", "title": "21% - 40%"},
      {"id":"3", "title": "41% - 60%"},
      {"id":"4", "title": "61% - 80%"},
      {"id":"5", "title": "81% - 100%"}
    ]

    if (optionsToDisplay) {
      let filtered = percentileOptions.map(option => {
        if (optionsToDisplay.find(x => parseInt(option.id) === x )) {
          return option
        }
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

