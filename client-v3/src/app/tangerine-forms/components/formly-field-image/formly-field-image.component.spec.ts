import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldImageComponent } from './formly-field-image.component';
import {TangerineFormsModule} from "../../tangerine-forms.module";

describe('FormlyFieldImageComponent', () => {
  let component: FormlyFieldImageComponent;
  let fixture: ComponentFixture<FormlyFieldImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
