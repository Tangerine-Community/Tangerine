import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoWaySyncComponent } from './two-way-sync.component';

describe('TwoWaySyncComponent', () => {
  let component: TwoWaySyncComponent;
  let fixture: ComponentFixture<TwoWaySyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoWaySyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoWaySyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
