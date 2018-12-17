import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserProfileComponent } from './import-user-profile.component';

describe('ImportUserProfileComponent', () => {
  let component: ImportUserProfileComponent;
  let fixture: ComponentFixture<ImportUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserProfileComponent ]
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
