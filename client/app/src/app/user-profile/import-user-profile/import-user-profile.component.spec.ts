import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserProfileComponent } from './import-user-profile.component';
import { UserProfileModule } from '../user-profile.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('ImportUserProfileComponent', () => {
  let component: ImportUserProfileComponent;
  let fixture: ComponentFixture<ImportUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UserProfileModule, AppRoutingModule]
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
});
