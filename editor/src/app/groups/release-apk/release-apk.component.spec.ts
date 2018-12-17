import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseApkComponent } from './release-apk.component';

describe('ReleaseApkComponent', () => {
  let component: ReleaseApkComponent;
  let fixture: ComponentFixture<ReleaseApkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseApkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseApkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
