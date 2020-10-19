import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseOnlineSurveyComponent } from './release-online-survey.component';

describe('ReleaseOnlineSurveyComponent', () => {
  let component: ReleaseOnlineSurveyComponent;
  let fixture: ComponentFixture<ReleaseOnlineSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseOnlineSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseOnlineSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
