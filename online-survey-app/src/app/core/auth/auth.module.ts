import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SurveyLoginComponent } from './_components/survey-login/survey-login.component';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        SharedModule,
        MatListModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AuthRoutingModule,
        MatAutocompleteModule,
        MatTableModule,
        MatCheckboxModule

    ],
  declarations: [SurveyLoginComponent],
  providers: [AuthenticationService, LoginGuard]
})
export class AuthModule { }
