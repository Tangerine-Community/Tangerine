import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsCreatorComponent } from './locations-creator.component';

describe('LocationsCreatorComponent', () => {
  let component: LocationsCreatorComponent;
  let fixture: ComponentFixture<LocationsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationsCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
