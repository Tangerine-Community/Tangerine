import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormLinksComponent } from './tangerine-form-links.component';

describe('TangerineFormLinksComponent', () => {
  let component: TangerineFormLinksComponent;
  let fixture: ComponentFixture<TangerineFormLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
