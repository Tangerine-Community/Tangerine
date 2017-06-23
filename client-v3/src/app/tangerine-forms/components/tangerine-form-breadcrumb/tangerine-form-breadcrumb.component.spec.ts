import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormBreadcrumbComponent } from './tangerine-form-breadcrumb.component';

describe('TangerineFormBreadcrumbComponent', () => {
  let component: TangerineFormBreadcrumbComponent;
  let fixture: ComponentFixture<TangerineFormBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
