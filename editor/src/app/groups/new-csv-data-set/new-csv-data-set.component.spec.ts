import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCsvDataSetComponent } from './new-csv-data-set.component';

describe('NewCsvDataSetComponent', () => {
  let component: NewCsvDataSetComponent;
  let fixture: ComponentFixture<NewCsvDataSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCsvDataSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCsvDataSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
