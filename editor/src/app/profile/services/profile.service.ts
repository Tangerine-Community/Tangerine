import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Profile} from './../profile.model';
import { map } from 'rxjs/operators'


@Injectable()
export class ProfileService {
    private profileUrl = '/api/profile';  // URL to web api
    private headers = new Headers({'Content-Type': 'application/json'});
    result: Object;
    error: Object;
    token: string;
    password: string;
    profile: Profile
    user_id: string;

    constructor(public http: HttpClient) {
        this.token = localStorage.getItem('token');
        this.password = localStorage.getItem('password');
        this.user_id = localStorage.getItem('user_id');
    }

    // getProfilePromise(): Promise<Profile>{
    //     console.log('profile: Get Data');
    //     var authheader = new Headers();
    //     let authToken = this.token + ':' + this.password;
    //     console.log("authToken: " + authToken);
    //     authheader.append('Authorization', 'Bearer ' + authToken);
    //     return this.http.get('/api/get-url/', {
    //         headers: authheader
    //     })
    //         .toPromise()
    //         .then(
    //             response => {
    //                 console.log("profile: " + JSON.stringify(response.json()))
    //                 return response.json() as Profile
    //             }
    //         )
    //         .catch(this.handleError);
    // }

    getProfile():any {
        console.log('profile: getProfile for ' + this.user_id);
        let params = new HttpParams();
        params.set('user_id', this.user_id)
        // authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password);
        let authToken = this.token + ':' + this.password;
        console.log("Profile service getProfile authToken: " + authToken);
        //this.headers.append('Authorization', 'Bearer ' + authToken);
        return this.http.get('/api/get-profile', {
            //headers: this.headers,
            params: params
        })
        .pipe(map(res =>
            this.profile = res as Profile
        ));
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    // update(profile: Profile): Promise<Profile> {
    update(profile: Profile) {
        console.log("Profile now: " + JSON.stringify(profile))
        // const url = `${this.profileUrl}/${profile._id}`;
        let bodyString = JSON.stringify(profile); // Stringify payload
        let headers      = new HttpHeaders({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // let headers      = new Headers({ 'Content-Type': 'x-www-form-urlencoded' }); // ... Set content type to JSON
        headers.append('Authorization', 'Bearer ' + this.token + ':' + this.password);
        // const url = `${this.profileUrl}`;
        var url = "/api/profile";
        // return this.http .post(url, bodyString, options)
        return this.http .post(url, bodyString, { headers: headers })
            // .toPromise()
            // .then(() => profile)
            // .catch(this.handleError);
            .pipe(map((res : any) => {
                let data = res.json();
                console.log("data in update from server: " + JSON.stringify(data));
                return data;
            }));
    }

}


