import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserProfileComponent } from './import-user-profile.component';
import { UserProfileModule } from '../user-profile.module';
import { AppRoutingModule } from '../../app-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { TwoWaySyncModule } from '../../two-way-sync/two-way-sync.module';
import { SyncRecordsModule } from 'src/app/core/sync-records/sync-records.module';

describe('ImportUserProfileComponent', () => {
  let component: ImportUserProfileComponent;
  let fixture: ComponentFixture<ImportUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, SyncRecordsModule, TwoWaySyncModule, UserProfileModule, AppRoutingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a sync message')
});
