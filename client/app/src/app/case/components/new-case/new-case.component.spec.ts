import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCaseComponent } from './new-case.component';
import { CaseModule } from '../../case.module';
import { AppRoutingModule } from 'src/app/app-routing.module';


describe('NewCaseComponent', () => {
  let component: NewCaseComponent;
  let fixture: ComponentFixture<NewCaseComponent>;

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
    fixture = TestBed.createComponent(NewCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
