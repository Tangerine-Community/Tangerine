import { IndexComponent } from './index/index.component';
import { MyTangyFormComponent } from './my-tangy-form/my-tangy-form.component';
import { Page3Component } from './page-3/page-3.component';
import { Page2Component } from './page-2/page-2.component';
import { Page1Component } from './page-1/page-1.component';
import { DemoComponent } from './demo/demo.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{ path: "forms/demo", component: DemoComponent }, { path: "forms/multipage-form-example/page-1", component: Page1Component }, { path: "forms/multipage-form-example/page-2", component: Page2Component }, { path: "forms/multipage-form-example/page-3", component: Page3Component }, { path: "forms/my-tangy-form", component: MyTangyFormComponent }, { path: "", component: IndexComponent }, { path: "index", component: IndexComponent }, ]; //: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
