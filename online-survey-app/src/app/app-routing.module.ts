import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsListComponent } from './forms-list/forms-list.component';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';

const routes: Routes = [
  { path: '', component: FormsListComponent},
  { path: 'forms', component: FormsListComponent},
  { path: 'tangy-forms/new/:formId', component: TangyFormsPlayerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
