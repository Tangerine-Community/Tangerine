import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncRecordsComponent } from './sync-records.component';
import { SyncRecordsModule } from '../sync-records.module';

describe('SyncRecordsComponent', () => {
  let component: SyncRecordsComponent;
  let fixture: ComponentFixture<SyncRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SyncRecordsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
