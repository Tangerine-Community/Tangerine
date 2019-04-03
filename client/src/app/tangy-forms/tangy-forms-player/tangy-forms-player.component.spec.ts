import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyFormsPlayerComponent } from './tangy-forms-player.component';
import { TangyFormsModule } from '../tangy-forms.module';
import { CaseManagementModule } from 'src/app/case-management/case-management.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('TangyFormsPlayerComponent', () => {
  let component: TangyFormsPlayerComponent;
  let fixture: ComponentFixture<TangyFormsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TangyFormsModule, CaseManagementModule, AppRoutingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangyFormsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
