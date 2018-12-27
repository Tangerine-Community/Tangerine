import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {WindowRef} from "../../core/window-ref.service";

describe('SeamlessWithWindowDirective', () => {
  let component: SeamlessWithWindowDirective;
  let fixture: ComponentFixture<SeamlessWithWindowDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeamlessWithWindowDirective ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeamlessWithWindowDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create an instance', () => {
    // const el: HTMLElement = fixture.nativeElement.querySelector('body');
    const windowRef: WindowRef = fixture.nativeElement
    const directive = new SeamlessWithWindowDirective(fixture,windowRef)
    expect(directive).toBeTruthy();
  });
});
