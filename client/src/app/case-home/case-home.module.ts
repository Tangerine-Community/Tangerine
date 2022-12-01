import { CaseReportsComponent } from './components/case-reports/case-reports.component';
import { CaseHomeDocs } from './case-home.docs';
import { DEFAULT_USER_DOCS } from './../shared/_tokens/default-user-docs.token';
import { CaseEventScheduleComponent } from './components/case-event-schedule/case-event-schedule.component';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { SharedModule } from './../shared/shared.module';
import { CaseHomeComponent } from './components/case-home/case-home.component';
import { CaseHomeRoutingModule } from './case-home-routing.module';
import { SearchModule } from './../core/search/search.module';
import { CaseModule } from './../case/case.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [
    CaseHomeComponent,
    CaseReportsComponent,
    CaseEventScheduleComponent
  ],
  imports: [
    CaseHomeRoutingModule,
    CaseModule,
    SearchModule,
    SharedModule,
    MatTabsModule,
    CommonModule
  ],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: CaseHomeDocs,
      multi: true
    }
  ]
})
export class CaseHomeModule { }
