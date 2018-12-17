import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseDatComponent } from './release-dat.component';

describe('ReleaseDatComponent', () => {
  let component: ReleaseDatComponent;
  let fixture: ComponentFixture<ReleaseDatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseDatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseDatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
