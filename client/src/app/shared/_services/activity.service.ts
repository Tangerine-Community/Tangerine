import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { VariableService } from './variable.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  // An array of form ids related to forms configured in search to be indexed with recent activity ordered reverse chronologically.
  private recentActivity:Array<string> = []
  private formsInfo:Array<FormInfo> = []
  private activityLimit = 100

  constructor(
    private userService: UserService,
    private tangyFormsInfoService:TangyFormsInfoService,
    private variableService: VariableService
  ) { }

  async initialize() {
    this.recentActivity = (await this.variableService.get('activity')) || []
    this.formsInfo = await this.tangyFormsInfoService.getFormsInfo()
  }

  async getActivity() {
    return this.recentActivity
  }

  async saveActivity(doc:any) {
    const formInfo = this.formsInfo.find(formInfo => formInfo.id === doc.form.id)
    if (!formInfo.searchSettings?.shouldIndex) return
    if (this.recentActivity.includes(doc._id)) {
      this.recentActivity.splice(this.recentActivity.indexOf(doc._id), 1)
      this.recentActivity.unshift(doc._id)
    } else if (this.recentActivity.length === this.activityLimit) {
      this.recentActivity.pop()
      this.recentActivity.unshift(doc._id)
    } else {
      this.recentActivity.unshift(doc._id)
    }
    await this.variableService.set('activity', this.recentActivity)
  }
}
