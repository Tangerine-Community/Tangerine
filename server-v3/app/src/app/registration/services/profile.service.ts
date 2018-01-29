import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Profile} from './../profile.model';

@Injectable()
export class ProfileService {
    result: Object;
    error: Object;
    token: string;
    password: string;
    profile: Profile

    constructor(public http: Http) {
        this.token = localStorage.getItem('token');
        this.password = localStorage.getItem('password');
    }

    getProfile() {
        console.log('profile: Get Data');
        var authheader = new Headers();
        authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password);
        return this.http.get('/api/get-url/', {
            headers: authheader
        })
            .map(res =>
                this.profile = res.json()
            );
    }
}