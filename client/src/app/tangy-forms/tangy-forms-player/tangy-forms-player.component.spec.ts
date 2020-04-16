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
          provide: TangyFormsInfoService,
          useClass: MockTangyFormsInfoService
        }, 
        {
          useClass: MockTangyFormService,
          provide: TangyFormService
        }],
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

  it('should load response and show specified template', (done) => {
    component.formResponseId = '123'
    component.templateId = 'foo'
    component.$rendered.subscribe(() => {
      expect(component.container.nativeElement.querySelector('h1').innerHTML).toEqual('This is input1.')
      done()
    })
    component.render()
  })

});
