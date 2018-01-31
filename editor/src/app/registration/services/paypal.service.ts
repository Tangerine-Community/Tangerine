import {Injectable} from '@angular/core';
import { Subject }    from 'rxjs/Subject';
// import {Http, Response, Headers} from '@angular/http';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import {Jsonp} from '@angular/http';
import { Jsonp, URLSearchParams } from '@angular/http';
//import {User} from '../../users/user.model';
import {Observable} from 'rxjs/Observable';

import {environment} from '../../../environments/environment'//how to distinguish from environment.prod (not yet sure how this works) ?????


@Injectable()
export class PaypalService {
    result: Object;
    error: Object;
    token: string;
    user_id: string;
    password: string;
    amt: string;
    plan: string;
    planRequested: string;

    constructor(public http: Http) {
        this.token = localStorage.getItem('token');
        this.password = localStorage.getItem('password');
        this.user_id = localStorage.getItem('user_id');
    }

    id = null;
    paypalCheckoutServer: null;

    // Observable string sources
    securetokenid = new Subject<string>();
    securetoken = new Subject<string>();
    // Observable string streams
    securetokenid$ = this.securetokenid.asObservable();
    securetoken$ = this.securetoken.asObservable();
    // Service message commands
    setSecuretokenid(securetokenid: string) {
        this.id = securetokenid
        console.log("setSecuretokenid and this.id = " + securetokenid)
        this.securetokenid.next(securetokenid);
    }
    setSecuretoken(securetoken: string) {
        console.log("setSecuretoken to: " + securetoken)
        this.token = securetoken
        this.securetoken.next(securetoken);
    }

    createBill(body: Object) {
        console.log(' createBill started');
        this.planRequested = body["planRequested"];

        let bodyString = JSON.stringify(body); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        headers.append('Authorization', 'Bearer ' + this.token + ':' + this.password);

        let options       = new RequestOptions({ headers: headers }); // Create a request option

        var submit = "/api/paypall/bill";
        console.log("payPalSubmit:" + submit + " body: " + JSON.stringify(body));

        return this.http.post(submit, bodyString, options) // ...using post request
            // .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
            // .map(response => response.json())
        .map((res : any) => {
           let data = res.json();
           console.log("data in createBill from server: " + JSON.stringify(data));
           return data;
        });
    }

    addSecureToken(body: Object) {
        console.log('PaypalService requestSecureToken started');

        let bodyString = JSON.stringify(body); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        headers.append('Authorization', 'Bearer ' + this.token + ':' + this.password);

        let options       = new RequestOptions({ headers: headers }); // Create a request option

        var payPalSubmit = "/api/paypaltoken";
        console.log("payPalSubmit:" + payPalSubmit + " body: " + JSON.stringify(body));

        return this.http.post(payPalSubmit, bodyString, options) // ...using post request
            .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
            //.map((res : any) => {
            //    let data = res.json();
            //    console.log("data: " + JSON.stringify(data));
           // });
    }
}
