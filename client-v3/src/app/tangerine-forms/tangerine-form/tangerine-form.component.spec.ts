import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormComponent } from './tangerine-form.component';

describe('TangerineFormComponent', () => {
  let component: TangerineFormComponent;
  let fixture: ComponentFixture<TangerineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
