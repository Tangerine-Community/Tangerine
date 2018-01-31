import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProfileService} from "./services/profile.service";
import {Profile} from "./profile.model";
import {Observable} from "rxjs/Observable";
import {CountriesService} from "../registration/services/countries.service";
import {StatesService} from "../registration/services/states.service";


@Component({
    selector: 'my-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css', './material.min.css'],

})
export class ProfilePaidComponent implements OnInit {
    profile: Profile
    isPaid = true
    isPaidMessage = ""

    constructor(
        private router: Router,
        private profileService: ProfileService
    ) { }
    getProfile()  {
        this.profileService.getProfile().subscribe(profile => this.profile = profile);
        // then(profile => {
        //     console.log("profile in ProfileComponent: " + JSON.stringify(profile))
        //     this.profile = profile
        //     }
        // );


    // .subscribe(
    //         data => { this.locations = data },
    //         err => console.error(err),
    //         () => console.log('done getting countries')
    //     );
    // .subscribe(profile => this.profile = profile);

    }
    ngOnInit(): void {
        this.getProfile()
        this.isPaidMessage = "Paypal has acknowledged the payment for your Tangerine Subscription. Thanks you very much! " +
            "We are spinning up Tangerine for you and will send you an email when it is ready. It will only take a couple minutes. " +
            " You may also check this website's Home page for URL and login details when the server is ready. "
    }
    edit(): void {
        this.router.navigate(['/profile-edit']);
    }
}






