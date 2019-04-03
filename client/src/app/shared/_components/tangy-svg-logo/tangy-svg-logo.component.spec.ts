import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangySvgLogoComponent } from './tangy-svg-logo.component';

describe('TangySvgLogoComponent', () => {
  let component: TangySvgLogoComponent;
  let fixture: ComponentFixture<TangySvgLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangySvgLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangySvgLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
