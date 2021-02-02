import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReleasesPwaTestComponent } from './historical-releases-pwa-test.component';

describe('HistoricalReleasesPwaTestComponent', () => {
  let component: HistoricalReleasesPwaTestComponent;
  let fixture: ComponentFixture<HistoricalReleasesPwaTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalReleasesPwaTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalReleasesPwaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
