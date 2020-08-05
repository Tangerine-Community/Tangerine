import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLocationListComponent } from './export-location-list.component';

describe('ExportLocationListComponent', () => {
  let component: ExportLocationListComponent;
  let fixture: ComponentFixture<ExportLocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportLocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
