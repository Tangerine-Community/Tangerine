import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
//import {User} from '../../users/user.model';
import {Observable} from 'rxjs/Observable';
//import {Router, RouteParams} from '@angular/router-deprecated';

@Injectable()
export class BillingService {
    result: Object;
    error: Object;
    loginObj: Object;
    token: string;
    user_id: string;
    password: string;
    
    
    constructor(public http: Http) {       
        this.token = localStorage.getItem('token');  // not needed as always passed in
        this.password = localStorage.getItem('password');
        this.user_id = localStorage.getItem('tokuser_id');
    }

    createBill(body: Object) {
        console.log(' createBill started');

        let bodyString = JSON.stringify(body); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        headers.append('Authorization', 'Bearer ' + this.token + ':' + this.password);

        let options       = new RequestOptions({ headers: headers }); // Create a request option

        var submit = "/api/bill";
        console.log("payPalSubmit:" + submit + " body: " + JSON.stringify(body));

        return this.http.post(submit, bodyString, options) // ...using post request
            .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
        //.map((res : any) => {
        //    let data = res.json();
        //    console.log("data: " + JSON.stringify(data));
        // });
    }

    billingCheck() {//no longer passing username as not needed
        console.log('billing: Get Data');
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token') + ':' + localStorage.getItem('password'));
        return this.http.post('/api/check-billing/', `{}`, {//(username not needed for this) `{"username": "${username}"}`
                headers: headers
        })
        .map(res => res.json());
    }

      
    usernameCheck(username) {

        console.log('usernameCheck: Get Data');
        return this.http.get('/assets/usernameInUse.json')
            .map(res => res.json());

        //console.log('check if username exists: ');
        //var headers = new Headers();
        //headers.append('Content-Type', 'application/x-www-form-urlencoded');//replace with url to check if username is already in use
        //var body = "username=" + username;
        //return this.http.post('/assets/usernameInUse.txt',//only holds username if there so if not there is empty string which evaluates to false
        //    body, {
        //        headers: headers
        //    })
        //    .map(res => res.json());
    }



}
