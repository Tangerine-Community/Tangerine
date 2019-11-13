import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFormResponseComponent } from './new-form-response.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UnsanitizeHtmlPipe } from 'src/app/shared/_pipes/unsanitize-html.pipe';
import { FormTypesService } from 'src/app/shared/_services/form-types.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormType } from 'src/app/shared/_classes/form-type.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from 'src/app/mocks/pipes/mock-translate.pipe';

const FORM_TYPES_INFO:Array<FormType> = [
  <FormType>{
    id: 'form',
    newFormResponseLinkTemplate: '/tangy-forms-player/${formId}',
    resumeFormResponseLinkTemplate: '/tangy-forms-player?formId=${formId}&responseId=${response._id}',
    iconTemplate: '${response && response.complete ? `assignment-turned-in` : `assignment`}'
  },
  <FormType>{
    id: 'case',
    newFormResponseLinkTemplate: '/case-new/${formId}',
    resumeFormResponseLinkTemplate: '/case/${response._id}',
    iconTemplate: '${response && response.complete ? `folder-special` : `folder`}'
  }
]

class MockFormTypesService {
  getFormTypes():Array<FormType> {
    return FORM_TYPES_INFO
  }
}

class MockFormsInfoService {
  getFormsInfo():Array<FormInfo> {
    return [
      <FormInfo>{
        "title":"Example Form",
        "src":"./assets/example/form.html",
        "id":"example",
        "type": "case",
        listed: true,
        "description": "Test test",
        "searchSettings": {
          "shouldIndex": true,
          "variablesToIndex": ["first_name", "last_name"],
          "primaryTemplate": "${searchDoc.variables.first_name} ${searchDoc.variables.last_name}",
          "secondaryTemplate": "Id: ${searchDoc._id}"
        }
      },
      <FormInfo>{
        "id":"form-0.36037678312388",
        "title":"New Form",
        "type": "form",
        listed: true,
        "description": "Test test",
        "src":"./assets/form-0.36037678312388/form.html",
        "searchSettings": {
          "shouldIndex": true,
          "variablesToIndex": [],
          "primaryTemplate": "",
          "secondaryTemplate": ""
        }
      }
    ]
  }
}

class MockRouter {
  navigateByUrl(url) {
    return
  }
}

describe('NewFormResponseComponent', () => {
  let component: NewFormResponseComponent;
  let fixture: ComponentFixture<NewFormResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FormTypesService,
          useClass: MockFormTypesService 
        },
        {
          provide: TangyFormsInfoService,
          useClass: MockFormsInfoService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ NewFormResponseComponent, UnsanitizeHtmlPipe, MockTranslatePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    try {
      fixture = TestBed.createComponent(NewFormResponseComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    } catch (e) {
      debugger
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list forms and open a new response', (done) => {
    expect(component).toBeTruthy();
    component.ready.addListener('ready', () => {
      fixture.detectChanges()

      expect(fixture.elementRef.nativeElement.querySelectorAll('.form-item').length).toEqual(2)
      component.navigating.addListener('navigating', (args) => {
        expect(args.url).toBe('/case-new/example')
        done()
      })
      fixture.elementRef.nativeElement.querySelectorAll('.form-item')[0].click()
      fixture.detectChanges()
    })
  });

});
