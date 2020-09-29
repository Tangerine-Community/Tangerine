import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormVersion} from "./classes/form-version.class";

@Injectable({
  providedIn: 'root'
})
export class TangyFormsInfoService {
  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  constructor(
    private http: HttpClient
  ) { }

  async getFormsInfo() {
    this.formsInfo = this.formsInfo ? this.formsInfo : <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    return this.formsInfo
  }

  async getFormInfo(id:string):Promise<FormInfo> {
    return (await this.getFormsInfo()).find(formInfo => formInfo.id === id)
  }

  async getFormTemplateMarkup(formId:string, formTemplateId:string):Promise<string> {
    const formInfo = await this.getFormInfo(formId)
    const formTemplate = formInfo.templates.find(formTemplate => formTemplate.id === formTemplateId)
    const formTemplateMarkup = await this.http.get(formTemplate.src, { responseType: 'text' }).toPromise()
    return formTemplateMarkup
  }
  
  getFoo() {
    return "foo"
  }

  /**
   * The src depends on the context:
   * context                                          : src

   *new form                                         : formInfo.src

   * preview - must view the most recent version      : formInfo.src

   * viewing a record created in a legacy group
   * with no formVersionId and no formVersions        : formInfo.src

   * viewing a record created in a legacy group with
   * no formVersionId but does have formVersions using
   * legacyOriginal flag                              : legacyVersion.src
   * - legacyVersion: FormVersion =  (version:FormVersion) => version.legacyOriginal === true

   * viewing a record created in a legacy group with
   * no formVersionId but does have formVersions
   * without legacyOriginal flag                      : lawd have mercy! formInfo.src

   * viewing a record created in a new group using
   * formVersionId and has formVersions               : formVersion.src
   *         const formVersion: FormVersion =  formInfo.formVersions.find((version:FormVersion) => version.id === formVersionId )

   * viewing a record created in a new group using
   * formVersionId and does not have formVersions     : formInfo.src
   */
  
  async getFormSrc(formId, formVersionId:string = '') {

    const formInfo = await this.getFormInfo(formId)

    /**
     * Either a form created without versions support, or one with formVersions but empty formVersions
     *
     * What clients would send no formVersionId?
     * - legacy formResponses
     * - editing a form- should always be editing form.html/draft.html
     * - tangerine-preview - should always be editing form.html/draft.html
     * We are also checking for window.location.hostname === 'localhost' below to handle tangerine-preview
     */
    function noFormVersionId(): string {
      let src;
      if (!formInfo.formVersions || formInfo.formVersions && formInfo.formVersions.length === 0) {
        src = formInfo.src
      } else {
        src = legacyOriginal();
      }
      return src
    }

    /**
     * Form the has versions and one has the legacyOriginal flag.
     */
    function legacyOriginal(): string {
      const legacyVersion: FormVersion = formInfo.formVersions.find((version: FormVersion) => version.legacyOriginal === true)
      return legacyVersion.src
    }

    function supportsFormVersions(formVersionId: string): string {
      if (formInfo.formVersions) {
        const formVersion: FormVersion = formInfo.formVersions.find((version: FormVersion) => version.id === formVersionId)
        return formVersion.src
      } else {
        return formInfo.src
      }
    }

    let src;
    const isSandbox = window.location.hostname === 'localhost' ? true : false
    if (isSandbox) {
      src = noFormVersionId()
    }

    if (!formVersionId) {
      src = noFormVersionId()
    } else {
      src = supportsFormVersions(formVersionId)
    }

    // last ditch case
    if (!src) {
      console.log(`getFormSrc: Unable to assign a src for ${formId} with version: ${formVersionId}`)
      src = formInfo.src
    }
    return src
  }

}
