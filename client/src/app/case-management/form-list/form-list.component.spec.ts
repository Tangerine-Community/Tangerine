import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormListComponent } from './form-list.component';
import { CaseManagementModule } from '../case-management.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('FormListComponent', () => {
  let component: FormListComponent;
  let fixture: ComponentFixture<FormListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        CaseManagementModule,
        AppRoutingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
