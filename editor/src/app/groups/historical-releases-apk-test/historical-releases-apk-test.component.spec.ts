import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReleasesApkTestComponent } from './historical-releases-apk-test.component';

describe('HistoricalReleasesApkTestComponent', () => {
  let component: HistoricalReleasesApkTestComponent;
  let fixture: ComponentFixture<HistoricalReleasesApkTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalReleasesApkTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalReleasesApkTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
