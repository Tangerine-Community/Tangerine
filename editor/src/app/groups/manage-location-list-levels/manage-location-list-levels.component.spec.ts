import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLocationListLevelsComponent } from './manage-location-list-levels.component';

describe('ManageLocationListLevelsComponent', () => {
  let component: ManageLocationListLevelsComponent;
  let fixture: ComponentFixture<ManageLocationListLevelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageLocationListLevelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLocationListLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
