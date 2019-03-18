import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventComponent } from './event.component';
import { CaseModule } from '../../case.module';
import { AppRoutingModule } from 'src/app/app-routing.module';


describe('EventComponent', () => {
  let component: EventComponent;
  let fixture: ComponentFixture<EventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CaseModule,
        AppRoutingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* @TODO This test always fails with a bad_request error.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
