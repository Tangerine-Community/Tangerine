import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { ProfileRoutingModule } from './profile-routing.module';
// Imports for loading & configuring the in-memory web api
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
import { ProfileComponent }         from './profile.component';
// import { DashboardComponent }   from './dashboard.component';
// import { HeroesComponent }      from './heroes.component';
// import { HeroDetailComponent }  from './hero-detail.component';
import { ProfileService }          from './services/profile.service';
import {MdlModule} from "angular2-mdl";
import { MdlSelectModule } from '@angular-mdl/select';
import {ProfileEditComponent} from "./profile-edit.component";
import {UtilsModule} from "../utils/utils.module";
import {ProfilePaidComponent} from "./profile-paid.component";
// import {HeroSearchComponent} from './hero-search.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ProfileRoutingModule,
        MdlModule,
        MdlSelectModule,
        UtilsModule
    ],
    declarations: [
        ProfileComponent,
        ProfileEditComponent,
        ProfilePaidComponent
    ],

    providers: [ ProfileService ],
    bootstrap: [ ProfileComponent ]
})
export class ProfileModule { }

