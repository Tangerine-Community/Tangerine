import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EftouchFormCardComponent } from './eftouch-form-card.component';

describe('EftouchFormCardComponent', () => {
  let component: EftouchFormCardComponent;
  let fixture: ComponentFixture<EftouchFormCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EftouchFormCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EftouchFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
