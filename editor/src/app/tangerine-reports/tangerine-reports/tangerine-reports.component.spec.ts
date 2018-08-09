import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineReportsComponent } from './tangerine-reports.component';

describe('TangerineReportsComponent', () => {
  let component: TangerineReportsComponent;
  let fixture: ComponentFixture<TangerineReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
