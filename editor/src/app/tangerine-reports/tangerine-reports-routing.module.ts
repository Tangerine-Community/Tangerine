import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineReportsComponent } from './tangerine-reports/tangerine-reports.component';

const routes: Routes = [
    { path: 'tangerine-reports', component: TangerineReportsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangerineReportsRoutingModule { }
