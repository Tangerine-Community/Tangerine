import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvDataSetDetailComponent } from './csv-data-set-detail.component';

describe('CsvDataSetDetailComponent', () => {
  let component: CsvDataSetDetailComponent;
  let fixture: ComponentFixture<CsvDataSetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvDataSetDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvDataSetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
