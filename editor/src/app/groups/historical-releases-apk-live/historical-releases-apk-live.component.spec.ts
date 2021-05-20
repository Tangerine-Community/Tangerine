import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReleasesApkLiveComponent } from './historical-releases-apk-live.component';

describe('HistoricalReleasesApkLiveComponent', () => {
  let component: HistoricalReleasesApkLiveComponent;
  let fixture: ComponentFixture<HistoricalReleasesApkLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalReleasesApkLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalReleasesApkLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
