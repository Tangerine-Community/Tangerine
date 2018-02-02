

import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {JsonpModule, Jsonp} from '@angular/http';
//import {User} from '../../users/user.model';
import {Observable} from 'rxjs/Observable';

@Injectable()

export class UsageService {
    result: Object;
    error: Object;
    token: string;
    user_id: string;
    password: string;
    
    
    
    constructor(public http: Http) {   
        this.token = localStorage.getItem('token');
        this.password = localStorage.getItem('password');
        this.user_id = localStorage.getItem('user_id');       
    }
    
    getResultsCount(token, password) {//have to pass in token and password as this object looses references when moving around app
        
        console.log('results count call initiated'); 
        var header = new Headers(); 
        //header.append('Content-Type', 'application/json');
        header.append('Authorization', 'Bearer ' + token + ':' + password); 
       
        return this.http.get('/api/usage/', {
            headers: header
        })
            .map(res => res.json());         
    }

    getUrl() {
       var authheader = new Headers(); 
       // authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password);
        let authToken = this.token + ':' + this.password;
        console.log("Home service getUrl authToken: " + authToken);
        authheader.append('Authorization', 'Bearer ' + authToken);
        //return this.http.get('/assets/users.json')
        //alert(this.user_id);
        return this.http.get('/api/get-url/', {
            headers: authheader
        })
            .map(res => res.json());         
    }

    getTSIPassword() {
       var authheader = new Headers(); 
       authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password); 
        //return this.http.get('/assets/users.json')
        //alert(this.user_id);
        return this.http.get('/api/get-tsi-password/', {
            headers: authheader
        })
            .map(res => res.json());         
    }

}
