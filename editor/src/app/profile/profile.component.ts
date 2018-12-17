import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ProfileService} from "./services/profile.service";
import {Profile} from "./profile.model";
import {DatePipe} from '@angular/common';


@Component({
    selector: 'my-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css', './material.min.css'],
    providers: [DatePipe]
})
export class ProfileComponent implements OnInit {
    profile: Profile
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
    }
    edit(): void {
        this.router.navigate(['/profile-edit']);
    }
}






