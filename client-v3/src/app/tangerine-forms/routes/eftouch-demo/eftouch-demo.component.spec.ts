import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EftouchDemoComponent } from './eftouch-demo.component';
import {TangerineFormsModule} from "../../tangerine-forms.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('EftouchDemoComponent', () => {
  let component: EftouchDemoComponent;
  let fixture: ComponentFixture<EftouchDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule, BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EftouchDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
