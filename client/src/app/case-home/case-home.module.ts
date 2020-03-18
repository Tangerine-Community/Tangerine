import { MatTabsModule } from '@angular/material';
import { SharedModule } from './../shared/shared.module';
import { CaseHomeComponent } from './components/case-home/case-home.component';
import { CaseHomeRoutingModule } from './case-home-routing.module';
import { SearchModule } from './../core/search/search.module';
import { CaseModule } from './../case/case.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [CaseHomeComponent],
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
