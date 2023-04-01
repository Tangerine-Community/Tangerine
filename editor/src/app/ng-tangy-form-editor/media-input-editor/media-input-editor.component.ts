import {AfterContentInit, Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FeedbackService} from "../feedback-editor/feedback.service";
import {FormMetadata} from "../feedback-editor/form-metadata";
import {Feedback} from "../feedback-editor/feedback";
import {MediaInput} from "./media-input-item";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MediaInputEditorService} from "./media-input-editor.service";

export interface DialogData {
  selectedMediaElements: string[]
}

@Component({
  selector: 'media-input-editor',
  templateUrl: './media-input-editor.component.html',
  styleUrls: ['./media-input-editor.component.css']
})

export class MediaInputEditorComponent implements OnInit, AfterContentInit {

  @Input() groupId:string
  @Input() formId:string
  formItems:any
  mediaItems:Array<MediaInput> = []
  dataSource
  showMediaItemsListing:boolean = true
  displayedColumns: string[] = ['title','name','mediaElements','controls'];
  showMediaInputForm:boolean = false;
  // @ViewChild('list', {static: true}) listEl: ElementRef;
  showMediaList: boolean = false
  selectedMediaElements: string[] = []

  constructor(
    public feedbackService:FeedbackService,
    private http: HttpClient,
    public dialog: MatDialog,
    public mediaInputEditorService: MediaInputEditorService
  ) {}

  async ngOnInit(): Promise<void> {
    let formHtml = await this.http.get(`/editor/${this.groupId}/content/${this.formId}/form.html`, {responseType: 'text'}).toPromise()
    this.formItems = await this.feedbackService.createFormItemsList(formHtml);
    await this.getMediaInputsList(null);
  }

  ngAfterContentInit() {
    // this.listEl.nativeElement.setAttribute('endpoint', './media-list')
  }

  private async getMediaInputsList(formMetaData: FormMetadata) {
    if (!formMetaData)
      formMetaData = await this.feedbackService.getForm(this.groupId, this.formId)
    let mediaInputItems = []
    // if (formMetaData.mediaInputItems) {
    //   let titledMediaItems = formMetaData.mediaInputItems.map(mediaItem => {
    //     let formItem = this.formItems.find(item => item.id === mediaItem['formItem'])
    //     // mediaItem.formItemName = formItem.title
    //     return mediaItem
    //   });
    //   // ORDER_BY formItem, percentile
    //   mediaInputItems = titledMediaItems
    // }

    this.mediaItems = this.formItems.map(fi => {
      if (formMetaData.mediaInputItems) {
        let mediaItem = formMetaData.mediaInputItems.find(item => item.formItem === fi['id'])
        if (mediaItem) {
          fi['mediaElements'] = mediaItem
        }
      }
      return fi
    })
    // console.log("feedbackItems: " + JSON.stringify(this.feedbackItems))
    this.dataSource = this.mediaItems
    if (this.mediaItems.length === 0) {
      this.showMediaItemsListing = false
    }
  }

  editMediaInput(formItemId: any) {
    this.showMediaInputForm = true
    this.showMediaList = true
    this.selectedMediaElements = []
    // this.dialog.open(MediaDialog, {
    //   data: {
    //     animal: 'panda',
    //   },
    // });
    // const dialogRef = this.dialog.open(MediaDialog, {
    //   data: {selectedMediaElements: this.selectedMediaElements},
    // });
    const dialogRef = this.dialog.open(MediaDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.selectedMediaElements = result;
      console.log("Now need to save this.selectedMediaElements: " + JSON.stringify(this.selectedMediaElements))
      let mediaInput = new MediaInput(formItemId, this.selectedMediaElements)
      this.mediaInputEditorService.update(this.groupId, this.formId, mediaInput).then(async (data) => {
        await this.getMediaInputsList(data)
        // this.showFeedbackForm = false
        // this.showFeedbackListing = true
      });
    });
  }

  deleteMediaInput(groupName: any, formId: any, formItem: any) {
    
  }
}

@Component({
  selector: 'media-list-dialog',
  templateUrl: 'media-list-dialog.html',
})
export class MediaDialog implements AfterContentInit {
  // constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  @ViewChild('list', {static: true}) listEl: ElementRef;
  
  constructor(public dialogRef: MatDialogRef<MediaDialog>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  
  ngAfterContentInit() {
    this.listEl.nativeElement.setAttribute('endpoint', './media-list')
  }
  selectMedia() {
    const pathsThatAreSelected = this.listEl.nativeElement.shadowRoot.querySelector('file-list').files.reduce((pathsThatAreSelected, file) => {
      return file.selected
        ? [...pathsThatAreSelected, file.path]
        : pathsThatAreSelected
    }, [])
    console.log("pathsThatAreSelected: " + JSON.stringify(pathsThatAreSelected))
    this.dialogRef.close(pathsThatAreSelected);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
