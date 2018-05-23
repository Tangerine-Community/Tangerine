import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { ProfileService } from './services/profile.service';
import { Profile } from './profile.model';
import { StatesService } from 'app/registration/services/states.service';
import { CountriesService } from '../registration/services/countries.service';
@Component({
  selector: 'profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  profile: Profile;
  states;
  locations;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private location: Location,
    private _countriesService: CountriesService,
    private _statesService: StatesService
  ) {}

  ngOnInit(): void {
    this.getCounties();
    this.getStates();
    this.profileService
      .getProfile()
      .subscribe((profile) => (this.profile = profile));
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    this.profileService
      .update(this.profile)
      // .then(() => this.goBack());
      .subscribe((data) => {
        this.goBack();
      });
  }

  getCounties() {
    this._countriesService.getData().subscribe(
      (data) => {
        this.locations = data;
      },
      (err) => console.error(err),
      () => console.log('done getting countries')
    );
  }
  getStates() {
    this._statesService.getData().subscribe(
      (data) => {
        this.states = data;
      },
      (err) => console.error(err),
      () => console.log('done getting states')
    );
  }
}
