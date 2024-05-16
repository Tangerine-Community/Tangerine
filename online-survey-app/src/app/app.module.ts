import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './core/auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TangySvgLogoComponent } from './shared/tangy-svg-logo/tangy-svg-logo.component';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsListComponent } from './forms-list/forms-list.component';
import { FormSubmittedSuccessComponent } from './form-submitted-success/form-submitted-success.component';
import { TangyErrorHandler } from './shared/_services/tangy-error-handler.service';

@NgModule({
  declarations: [
    AppComponent,
    TangySvgLogoComponent,
    TangyFormsPlayerComponent,
    FormsListComponent,
    FormSubmittedSuccessComponent
  ],
  imports: [
    AuthModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    HttpClientModule,
    MatCardModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [TangyErrorHandler],
  bootstrap: [AppComponent]
})
export class AppModule { }
