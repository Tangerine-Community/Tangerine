import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Profile} from './../profile.model';
import { map } from 'rxjs/operators'

@Injectable()
export class ProfileService {
    result: Object;
    error: Object;
    token: string;
    password: string;
    profile: Profile

    constructor(public http: HttpClient) {
        this.token = localStorage.getItem('token');
        this.password = localStorage.getItem('password');
    }

    getProfile() {
        console.log('profile: Get Data');
        var authheader = new HttpHeaders();
        authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password);
        return this.http.get<Profile>('/api/get-url/', {
            headers: authheader
        })
        .pipe(map(res =>
            this.profile = res
        ));
    }
}