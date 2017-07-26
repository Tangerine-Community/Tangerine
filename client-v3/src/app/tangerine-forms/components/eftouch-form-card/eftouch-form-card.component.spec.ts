import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EftouchFormCardComponent } from './eftouch-form-card.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {TangerineFormsModule} from "../../tangerine-forms.module";

describe('EftouchFormCardComponent', () => {
  let component: EftouchFormCardComponent;
  let fixture: ComponentFixture<EftouchFormCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule,
        BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EftouchFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
