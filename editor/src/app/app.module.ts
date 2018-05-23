import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MdlModule } from 'angular2-mdl';
import 'rxjs/add/operator/map'; // added so we could use map in services as needed to avoid red squigglies
import 'rxjs/add/operator/mergeMap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { AuthModule } from './core/auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { ProfileModule } from './profile/profile.module';
import { SupportComponent } from './support/support.component';

@NgModule({
  declarations: [AppComponent, SupportComponent],
  imports: [
    AppRoutingModule,
    AuthModule,
    ProfileModule,
    GroupsModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MdlModule
  ],
  providers: [AuthGuard, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
