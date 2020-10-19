import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintStimuliScreenComponent } from './print-stimuli-screen.component';

describe('PrintStimuliScreenComponent', () => {
  let component: PrintStimuliScreenComponent;
  let fixture: ComponentFixture<PrintStimuliScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintStimuliScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintStimuliScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
