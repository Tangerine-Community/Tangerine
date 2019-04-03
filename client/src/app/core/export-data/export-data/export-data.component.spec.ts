import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataComponent } from './export-data.component';
import { ExportDataModule } from '../export-data.module';
import { SyncRecordsModule } from '../../sync-records/sync-records.module';

describe('ExportDataComponent', () => {
  let component: ExportDataComponent;
  let fixture: ComponentFixture<ExportDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ExportDataModule, SyncRecordsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
