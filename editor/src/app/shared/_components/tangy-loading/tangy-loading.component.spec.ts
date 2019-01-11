import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyLoadingComponent } from './tangy-loading.component';

describe('TangyLoadingComponent', () => {
  let component: TangyLoadingComponent;
  let fixture: ComponentFixture<TangyLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangyLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangyLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
