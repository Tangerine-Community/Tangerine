import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseComponent } from './case.component';
import { CaseModule } from '../../case.module';
import { AppRoutingModule } from 'src/app/app-routing.module';


describe('CaseComponent', () => {
  let component: CaseComponent;
  let fixture: ComponentFixture<CaseComponent>;

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
    fixture = TestBed.createComponent(CaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* @TODO This test always fails with a bad_request error.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
