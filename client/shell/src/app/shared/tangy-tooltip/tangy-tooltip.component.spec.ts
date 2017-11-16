import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyTooltipComponent } from './tangy-tooltip.component';

describe('TangyTooltipComponent', () => {
  let component: TangyTooltipComponent;
  let fixture: ComponentFixture<TangyTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangyTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangyTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
