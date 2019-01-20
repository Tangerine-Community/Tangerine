import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseComponent } from './case/case.component';
import { EventComponent } from './event/event.component';
//import { FormComponent } from './form/form.component';
import { CasesComponent } from './cases/cases.component';
import { NewCaseComponent } from './new-case/new-case.component';
import { CaseRoutingModule } from './case-routing.module';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CaseRoutingModule,
    CommonModule
  ],
  declarations: [
    EventComponent,
    CasesComponent,
    CaseComponent,
    NewCaseComponent
  ]
})
export class CaseModule { }
