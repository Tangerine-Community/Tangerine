import { MockUserService } from './../../shared/_services/user.service.mock';
import { UserService } from 'src/app/shared/_services/user.service';
import { MockTangyFormsInfoService } from './../tangy-forms-info.service.mock';
import { TangyFormService } from './../tangy-form.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyFormsPlayerComponent } from './tangy-forms-player.component';
import { TangyFormsModule } from '../tangy-forms.module';
import { CaseManagementModule } from 'src/app/case-management/case-management.module';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MockTangyFormService } from '../tangy-form.service.mock';
import { TangyFormsInfoService } from '../tangy-forms-info-service';

describe('TangyFormsPlayerComponent', () => {
  let component: TangyFormsPlayerComponent;
  let fixture: ComponentFixture<TangyFormsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ 
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          useClass: MockTangyFormService,
          provide: TangyFormService
        }],
      imports: [TangyFormsModule, AppRoutingModule]
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

  it('should load response and show specified template', (done) => {
    // See MockTangyFormsInfoService for the data and template being used.
    component.formResponseId = '123'
    component.templateId = 'foo'
    component.$rendered.subscribe(() => {
      debugger;
      expect(component.container.nativeElement.querySelector('h1').innerHTML).toEqual('This is input1.')
      done()
    })
    component.render()
  })

  // other tests
  // - formVersionId but no formVersions
  // - no formVersionId
  // check if isSandbox.
  it('should load response and show correct version', (done) => {
    // See MockTangyFormsInfoService for the data and template being used.
    component.formId = 'original'
    component.formResponseId = '123'
    component.$rendered.subscribe(() => {
      debugger;
      expect(component.container.nativeElement.querySelector('#item1').title).toEqual('Screening')
      done()
    })
    component.render()
  })

});
