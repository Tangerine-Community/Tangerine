import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormPagerComponent } from './tangerine-form-pager.component';

describe('TangerineFormPagerComponent', () => {
  let component: TangerineFormPagerComponent;
  let fixture: ComponentFixture<TangerineFormPagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormPagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormPagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
