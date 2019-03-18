import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFormComponent } from './event-form.component';
import { CaseModule } from '../../case.module';
import { AppRoutingModule } from 'src/app/app-routing.module';


describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

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
    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
