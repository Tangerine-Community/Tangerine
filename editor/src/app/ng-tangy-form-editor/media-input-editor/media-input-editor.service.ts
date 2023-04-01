import { Injectable } from '@angular/core';
import {Feedback} from "../feedback-editor/feedback";
import {FormMetadata} from "../feedback-editor/form-metadata";
import {FeedbackService} from "../feedback-editor/feedback.service";
import {MediaInput} from "./media-input-item";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MediaInputEditorService {

  constructor(public feedbackService:FeedbackService,
              private http: HttpClient) { }

  async update(groupName:string, formId:string,  mediaInput: MediaInput) {
    const form = await this.feedbackService.getForm(groupName, formId);
    if (typeof form.mediaInputItems === 'undefined') {
      form.mediaInputItems = []
    }
    // delete the previous version
    let feedbackItem = form.mediaInputItems.find(item => item.formItem === mediaInput.formItem)
    // remove old item
    const filteredItems = form.mediaInputItems.filter(item => item !== feedbackItem)
    form.mediaInputItems = filteredItems
    form.mediaInputItems.push(mediaInput)
    let formsJson = await this.http.get<Array<FormMetadata>>(`/editor/${groupName}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, form)
    })
    let file = {
      groupId: groupName,
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    }
    await this.http.post('/editor/file/save', file).toPromise()
    return form
  }
}
