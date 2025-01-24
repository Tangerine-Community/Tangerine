import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module'
import { CaseDefinitionsService } from './services/case-definitions.service';
import { CaseService } from './services/case.service';
import { TangyFormsModule } from '../tangy-forms/tangy-forms.module';


@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
  ],
  imports: [
    SharedModule,
    TangyFormsModule,
    CommonModule
  ],
  providers: [
    CaseDefinitionsService,
    CaseService
  ],
  declarations: [
  ]
})
export class CaseModule { }
