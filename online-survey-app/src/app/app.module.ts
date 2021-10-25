import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { TangySvgLogoComponent } from './shared/tangy-svg-logo/tangy-svg-logo.component';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsListComponent } from './forms-list/forms-list.component';
import { FormSubmittedSuccessComponent } from './form-submitted-success/form-submitted-success.component';
import { LanguageSelectComponent } from './language-select/language-select.component';

@NgModule({
  declarations: [
    AppComponent,
    TangySvgLogoComponent,
    TangyFormsPlayerComponent,
    FormsListComponent,
    FormSubmittedSuccessComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    HttpClientModule,
    MatCardModule,
    MatTabsModule,
    MatListModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
