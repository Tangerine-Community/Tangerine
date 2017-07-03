import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormCarouselComponent } from './tangerine-form-carousel.component';

describe('TangerineFormCarouselComponent', () => {
  let component: TangerineFormCarouselComponent;
  let fixture: ComponentFixture<TangerineFormCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
