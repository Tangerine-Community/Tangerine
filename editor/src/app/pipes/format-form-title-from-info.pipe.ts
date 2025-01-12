import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formTitleFromInfo',
})
export class FormTitleFromInfoPipe implements PipeTransform {
  transform(formInfo) {
    if(formInfo.id){
        if(!formInfo.title){
            return formInfo.id
          }
          if(!formInfo.title.includes('t-lang')) return formInfo.title;
          if(formInfo.title.includes('t-lang')) {
            const titleDomString = new DOMParser().parseFromString(formInfo.title, 'text/html')
            const formTitleEnglish = titleDomString.querySelector('t-lang[en]')
            formInfo.title = formTitleEnglish ? formTitleEnglish.textContent : titleDomString.querySelector('t-lang').textContent
            return formInfo.title
          }
    }
    if(formInfo.formId){
        if(!formInfo.formTitle){
            return formInfo.formId
          }
          if(!formInfo.formTitle.includes('t-lang')) return formInfo.formTitle;
          if(formInfo.formTitle.includes('t-lang')) {
            const titleDomString = new DOMParser().parseFromString(formInfo.formTitle, 'text/html')
            const formTitleEnglish = titleDomString.querySelector('t-lang[en]')
            formInfo.formTitle = formTitleEnglish ? formTitleEnglish.textContent : titleDomString.querySelector('t-lang').textContent
            return formInfo.formTitle
          }
    }
  }
}