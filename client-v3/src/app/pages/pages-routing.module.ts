import { IndexComponent } from './index/index.component';
import { MyTangyFormComponent } from './my-tangy-form/my-tangy-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{ path: "forms/my-tangy-form", component: MyTangyFormComponent }, { path: "", component: IndexComponent }, { path: "index", component: IndexComponent }, ]; //: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
