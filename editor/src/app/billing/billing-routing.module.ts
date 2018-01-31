import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }                from '../auth-guard.service';

import { BillsComponent }    from './billing.component';

const billingRoutes: Routes = [
  //{ path: 'bills', component: Bills }
  { path: 'bills', component: BillsComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(billingRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BillingRoutingModule { }
