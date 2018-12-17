import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTangyFormEditorComponent } from './ng-tangy-form-editor.component';

describe('NgTangyFormEditorComponent', () => {
  let component: NgTangyFormEditorComponent;
  let fixture: ComponentFixture<NgTangyFormEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgTangyFormEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgTangyFormEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
