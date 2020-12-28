import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReleasesPwaLiveComponent } from './historical-releases-pwa-live.component';

describe('HistoricalReleasesPwaLiveComponent', () => {
  let component: HistoricalReleasesPwaLiveComponent;
  let fixture: ComponentFixture<HistoricalReleasesPwaLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalReleasesPwaLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalReleasesPwaLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
