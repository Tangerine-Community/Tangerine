import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormPageComponent } from './tangerine-form-page.component';

describe('TangerineFormPageComponent', () => {
  let component: TangerineFormPageComponent;
  let fixture: ComponentFixture<TangerineFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
