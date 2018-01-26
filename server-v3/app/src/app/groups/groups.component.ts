import { Component, OnInit } from '@angular/core';
import {GroupsService} from './services/groups.service';
import {TruncatePipe} from '../pipes/truncate';
//import {RegistrationService} from '../registration/services/registration.service';
//import { AuthService } from '../auth.service';

@Component({
  //selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsComponent implements OnInit {

  result;
    error: boolean = false;
    readyForDisplay: boolean = false;

    constructor(
        private _groupsService: GroupsService) {
    }


    ngOnInit() {
        console.log('hello groups `Groups` component');
        this.getData();
    };
    
    // loginStatusCall = this._registrationService.getSession(localStorage.getItem('token'), localStorage.getItem('password'))
    //     .subscribe(
    //     data => { console.log('data returned from getSession call' + data);  },//this.result = data,
    //     err => { if (err.status && err.status == 401) { window.location.href = "/login" } }, //returns status 401 if not logged in
    //     () => console.log('done')
    //     );

    getData() {

        this._groupsService.getGroups() //tsiInstanceId passed in (variable stored in cookie?)
            .subscribe(
            data => {
                console.log(data); this.result = data; this.readyForDisplay = true;
            },
            err => { console.log('error in getting data for groups: ' + JSON.stringify(err, null, 2)); this.error = true;}, 
            () => console.log('done')
            );
    }

    get value(): string {
        return JSON.stringify(this.result, null, 2);
    }

}
