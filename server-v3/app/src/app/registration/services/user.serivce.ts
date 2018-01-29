//NOT USING THIS AS IT IS INSIDE REGISTER COMPOENENT
// user.ts //handle user logged in status get authentication token to restrict user if not (jw note)
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
//import localStorage from 'localStorage';

@Injectable()
export class UserService {
    private loggedIn = false;

    constructor(private http: Http) {
        //this.loggedIn = !!localStorage.getItem('auth_token');//this test is happening inside my-router so not neede here
    }

    login(email, password) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let credentials = JSON.stringify({ email, password });

        return this.http
            .post(
            '/login',
            JSON.stringify(credentials),
            { headers: headers }
            )
            .map(res => res.json())
            .map((res) => {
                if (res.success) {
                    localStorage.setItem('auth_token', res.auth_token);
                    this.loggedIn = true;
                }

                return res.success;
            });
    }

    //logout() {
    //    localStorage.removeItem('auth_token');
    //    this.loggedIn = false;
    //}
}