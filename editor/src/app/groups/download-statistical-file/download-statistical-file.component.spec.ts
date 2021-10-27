import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadStatisticalFileComponent } from './download-statistical-file.component';

describe('DownloadStatisticalFileComponent', () => {
  let component: DownloadStatisticalFileComponent;
  let fixture: ComponentFixture<DownloadStatisticalFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadStatisticalFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadStatisticalFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
