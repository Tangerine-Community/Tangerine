import { CaseEventScheduleListComponent } from './components/case-event-schedule-list/case-event-schedule-list.component';
import { CaseEventScheduleComponent } from './components/case-event-schedule/case-event-schedule.component';
import { MatTabsModule } from '@angular/material/tabs';
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
    CaseEventScheduleComponent,
    CaseEventScheduleListComponent
  ],
  imports: [
    CaseHomeRoutingModule,
    CaseModule,
    SearchModule,
    SharedModule,
    MatTabsModule,
    CommonModule
  ]
})
export class CaseHomeModule { }
