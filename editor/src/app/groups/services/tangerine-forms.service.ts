import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { id as generate } from 'rangen';
import { WindowRef } from '../../core/window-ref.service';
import { Loc } from 'tangy-form/util/loc.js';
import uuidv4 from 'uuid/v4'
import { TangerineFormInfo, TangerineForm } from '../../../../src/app/shared/_classes/tangerine-form.class';
import { FilesService } from './files.service';

@Injectable()
export class TangerineFormsService {
  constructor(
    private windowRef: WindowRef,
    private httpClient: HttpClient,
    private errorHandler: TangyErrorHandler,
    private filesService: FilesService
  ) { }

  async getFormsList(groupId: string) {
    try {
      return <Array<any>>[
        ...await this.getFormsInfo(groupId),
        <TangerineFormInfo>{
          id: 'user-profile',
          title: 'User Profile',
          type: 'form',
          src: './assets/user-profile/form.html'
        },
        <TangerineFormInfo>{
          id: 'reports',
          title: 'Reports',
          type: 'form',
          src: './assets/reports/form.html'
        }
      ]
        .map(formInfo => ({
          ...formInfo,
          printUrl: `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}/#/tangy-form-editor/${groupId}/${formInfo.id}/print`
        }));
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getFormsInfo(groupId: string) {
    try {
      return <Array<TangerineFormInfo>>await this.filesService.get(groupId, './forms.json')
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async createForm(groupId, formTitle = 'New Form', formContents = '') {
    const formId = `form-${uuidv4()}`
    const formInfo = <TangerineFormInfo>{
      id: formId,
      type: 'form',
      title: formTitle,
      src: `./assets/${formId}/form.html`
    }
    let safeFormContents = ''
    if (formContents === '') {
      safeFormContents = `
        <tangy-form id="${formInfo.id}" title="${formTitle}">
          <tangy-form-item id="item_${uuidv4()}" title="Item 1">
            <template>
              <tangy-input name="input1" label="First question..."></tangy-input>
            </template>
          </tangy-form-item>
        </tangy-form>
      `
    } else {
      const templateEl = document.createElement('template')
      templateEl.innerHTML = formContents
      templateEl.content.querySelector('tangy-form').setAttribute('id', formId)
      safeFormContents = templateEl.innerHTML
    }
          
    const formsInfo = await this.getFormsInfo(groupId)
    const updatedFormsInfo = [...formsInfo, formInfo]
    await this.filesService.save(groupId, `./forms.json`, updatedFormsInfo)
    await this.filesService.save(groupId, `./${formId}/form.html`, safeFormContents) 
    return formId
  }

  async getForm(groupId, formId): Promise<TangerineForm> {
    const formInfo = (await this.getFormsInfo(groupId)).find(formInfo => formInfo.id === formId)
    return <TangerineForm>{
      ...formInfo,
      contents: await this.httpClient.get(`/app/${groupId}/${formInfo.src}`, { responseType: 'text' }).toPromise()
    }
  }

  async saveForm(groupId, form: TangerineForm) {
    const formsJson = (await this.getFormsInfo(groupId))
      .map(formInfo => {
        return formInfo.id !== form.id
          ? formInfo
          : {
            id: form.id,
            type: form.type,
            title: form.title,
            src: form.src
          }
      })
    await this.filesService.save(groupId, `./forms.json`, formsJson)
    await this.filesService.save(groupId, form.src, form.contents)
  }

  async deleteForm(groupId, formId) {
    try {
      const formsInfo = await this.getFormsInfo(groupId);
      await this.filesService.save(groupId, './forms.json', formsInfo.filter(formInfo => formInfo.id !== formId));
      await this.filesService.delete(groupId, `./${formId}/form.html`);
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Delete Form.'));
    }
  }
  async archiveForm(groupId: string, formId: string) {
    try {
      const formsInfo = await this.getFormsInfo(groupId);
      const formsJSON = formsInfo.map(form => {
        if (form.id === formId) {
          return { ...form, archived: true };
        } else { return form; }
      });
      await this.filesService.save(groupId, './forms.json', formsJSON);
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Archive Form.'));
    }

  }
  async unArchiveForm(groupId: string, formId: string) {
    try {
      const formsInfo = await this.getFormsInfo(groupId);
      const formsJSON = formsInfo.map(form => {
        if (form.id === formId) {
          return { ...form, archived: false };
        } else { return form; }
      });
      await this.filesService.save(groupId, './forms.json', formsJSON);
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Unarchive Form.'));
    }

  }
  async copyForm(formId, sourceGroupId, targetGroupId) {
    console.log(`Copy form ${formId} from ${sourceGroupId} to ${targetGroupId}`)
    // Get form title and contents.
    const form = await this.getForm(sourceGroupId, formId)
    // Create it...
    await this.createForm(targetGroupId, form.title, form.contents)
  }

}
