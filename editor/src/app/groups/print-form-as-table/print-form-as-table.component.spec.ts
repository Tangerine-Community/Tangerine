import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFormAsTableComponent } from './print-form-as-table.component';

describe('PrintFormAsTableComponent', () => {
  let component: PrintFormAsTableComponent;
  let fixture: ComponentFixture<PrintFormAsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintFormAsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintFormAsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
