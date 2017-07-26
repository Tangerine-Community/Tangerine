import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormSessionsCsvComponent } from './tangerine-form-sessions-csv.component';

describe('TangerineFormSessionsCsvComponent', () => {
  let component: TangerineFormSessionsCsvComponent;
  let fixture: ComponentFixture<TangerineFormSessionsCsvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormSessionsCsvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormSessionsCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
