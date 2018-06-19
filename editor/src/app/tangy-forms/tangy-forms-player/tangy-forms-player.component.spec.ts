import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyFormsPlayerComponent } from './tangy-forms-player.component';

describe('TangyFormsPlayerComponent', () => {
  let component: TangyFormsPlayerComponent;
  let fixture: ComponentFixture<TangyFormsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangyFormsPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangyFormsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
