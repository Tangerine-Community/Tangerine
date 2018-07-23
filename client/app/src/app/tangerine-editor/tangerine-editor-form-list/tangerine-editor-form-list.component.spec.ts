import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineEditorFormListComponent } from './tangerine-editor-form-list.component';

describe('TangerineEditorFormListComponent', () => {
  let component: TangerineEditorFormListComponent;
  let fixture: ComponentFixture<TangerineEditorFormListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineEditorFormListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineEditorFormListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
