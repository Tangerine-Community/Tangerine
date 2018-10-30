import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationListEditorComponent } from './location-list-editor.component';

describe('LocationListEditorComponent', () => {
  let component: LocationListEditorComponent;
  let fixture: ComponentFixture<LocationListEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationListEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationListEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
