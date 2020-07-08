import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreBackupComponent } from './restore-backup.component';

describe('RestoreBackupComponent', () => {
  let component: RestoreBackupComponent;
  let fixture: ComponentFixture<RestoreBackupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreBackupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
