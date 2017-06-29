import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormResumeDemoComponent } from './tangerine-form-resume-demo.component';

describe('TangerineFormResumeDemoComponent', () => {
  let component: TangerineFormResumeDemoComponent;
  let fixture: ComponentFixture<TangerineFormResumeDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormResumeDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormResumeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
