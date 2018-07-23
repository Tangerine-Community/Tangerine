import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineEditorDashboardComponent } from './tangerine-editor-dashboard.component';

describe('TangerineEditorDashboardComponent', () => {
  let component: TangerineEditorDashboardComponent;
  let fixture: ComponentFixture<TangerineEditorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineEditorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineEditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
