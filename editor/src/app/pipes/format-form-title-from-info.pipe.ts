import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formTitleFromInfo',
})
/*
 * Angular Pipe to format form title
 * If the title doesnt contain t-lang tag, return the text.
 * Otherwise, use the English translation if it exists or the first translation if there's no English version of the title, followed by the form Id
 */
export class FormTitleFromInfoPipe implements PipeTransform {
  transform(formInfo) {
    const formId = formInfo.id || formInfo.formId
    if (formId) {
      if (!formInfo.title) return formId
      if (!formInfo.title.includes('t-lang')) return formInfo.title;
      if (formInfo.title.includes('t-lang')) {
        const titleDomString = new DOMParser().parseFromString(formInfo.title, 'text/html')
        const formTitleEnglish = titleDomString.querySelector('t-lang[en]')
        formInfo.title = formTitleEnglish ? formTitleEnglish.textContent : titleDomString.querySelector('t-lang').textContent
        return formInfo.title
      }
    }
  }
}