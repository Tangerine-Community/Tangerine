import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasePwaComponent } from './release-pwa.component';

describe('ReleasePwaComponent', () => {
  let component: ReleasePwaComponent;
  let fixture: ComponentFixture<ReleasePwaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleasePwaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleasePwaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
