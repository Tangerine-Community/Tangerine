import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvDataSetsComponent } from './csv-data-sets.component';

describe('CsvDataSetsComponent', () => {
  let component: CsvDataSetsComponent;
  let fixture: ComponentFixture<CsvDataSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvDataSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvDataSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
