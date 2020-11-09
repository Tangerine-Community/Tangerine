import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFormBackupComponent } from './print-form-backup.component';

describe('PrintFormBackupComponent', () => {
  let component: PrintFormBackupComponent;
  let fixture: ComponentFixture<PrintFormBackupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintFormBackupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintFormBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
