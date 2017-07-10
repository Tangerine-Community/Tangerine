import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdCardModule,
  MdInputModule,
  MdToolbarModule,
  MdSidenavModule
} from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyModule, FormlyBootstrapModule } from 'ng-formly';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { tangerineFormSessionReducer } from './reducers/tangerine-form-session-reducer';
import { TangerineFormComponent } from './containers/tangerine-form/tangerine-form.component';
import { TangerineFormsRoutingModule } from './tangerine-forms-routing.module';
import { TangerineFormsDemoComponent } from './routes/tangerine-forms-demo/tangerine-forms-demo.component';
import { TangerineFormCardComponent } from './components/tangerine-form-card/tangerine-form-card.component';
import { TangerineFormCardDemoComponent } from './routes/tangerine-form-card-demo/tangerine-form-card-demo.component';
import { TangerineFormSessionComponent } from './components/tangerine-form-session/tangerine-form-session.component';
import { TangerineFormResumeDemoComponent } from './routes/tangerine-form-resume-demo/tangerine-form-resume-demo.component';
import {EftouchDemoComponent} from "./routes/eftouch-demo/eftouch-demo.component";
import { EftouchFormCardComponent } from './components/eftouch-form-card/eftouch-form-card.component';
import { FormlyFieldImageComponent } from './components/formly-field-image/formly-field-image.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MdButtonModule,
    MdCheckboxModule,
    MdCardModule,
    MdInputModule,
    MdToolbarModule,
    MdSidenavModule,
    TangerineFormsRoutingModule,
    FormlyModule.forRoot({
      types: [
        { name: 'toggle', component: FormlyFieldImageComponent}
        ]}),
    FormlyBootstrapModule,
    StoreModule.provideStore({ tangerineFormSession: tangerineFormSessionReducer }),
    StoreDevtoolsModule.instrumentOnlyWithExtension({
      maxAge: 100
    })
  ],
  declarations: [
    TangerineFormComponent,
    TangerineFormsDemoComponent,
 //   TangerineFormPagerComponent,
 //   TangerineFormBreadcrumbComponent,
    TangerineFormCardComponent,
 TangerineFormCardDemoComponent,
 TangerineFormSessionComponent,
 TangerineFormResumeDemoComponent,
    EftouchDemoComponent,
    EftouchFormCardComponent,
    FormlyFieldImageComponent
 //   TangerineFormCarouselComponent
  ],
  exports: [
    TangerineFormCardComponent,
    TangerineFormComponent
  ]
})
export class TangerineFormsModule { }
