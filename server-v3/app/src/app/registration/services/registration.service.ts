import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Jsonp} from '@angular/http';
//import {User} from '../../users/user.model';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RegistrationService {
    result: Object;
    error: Object;
    loginObj: Object;
    // token: string;           not needed as always passed in
    // user_id: string;
    // password: string;
    
    
    constructor(public http: Http) {          //, public Jsonp: Jsonp
    }
    
    //note jw: http service in Angular 2.0 is using Observables not promises
    registerUser(value) {
        console.log('registering user started');
        var headers = new Headers();
        headers.append('Content-Type', 'application/json')
        var body = JSON.stringify(value);
        
        return this.http.post('/api/users/',
            body, {
                headers: headers
            })
            .map(res => res.json());
    }

    loginUser(value) {
        console.log('login page: Post');
        var headers = new Headers();
        var authheader = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "username=" + value.username + "&password=" + value.password;
        var body2 = "username=" + value.username;
        return this.http.post('/auth/login/', body, {
                headers: headers
            })
            .map((res : any) => {//this only runs if you get the actual data and not on error
                let data = res.json();
                // this.token = data.token;
                // this.user_id = data.user_id;
                // this.password = data.password;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('password', data.password);

                authheader.append('Authorization', 'Bearer ' + data.token + ':' + data.password); 

            })
            .flatMap((res) => //here we make another call to server to check if user has ever logged in and 
            //ensure we log that user has logged. The status of this call is basis for what page they see when logging in.
                this.http.post('/api/trackLogin/', body2, {
                headers: authheader}).map((res : any) => {
                let data = res.json();
                return data;
            }));
            
            //.map(res => res.json());
    }
    
    retrievePW(value) {
        console.log('password page: Post');
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "email=" + value.email;
        return this.http.post('/auth/forgot-password/', body, {
                headers: headers
            })
            .map(res => res.json());
    }

    retrieveID(value) {
        console.log('username page: Post');
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "email=" + value.email;
        return this.http.post('/api/email-username', body, {
                headers: headers
            })
            .map(res => res.json());
    }
    
    changePW(value) {
        console.log('password reset page: Post');
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "token=" +value.token + "&password=" + value.password  + "&confirmPassword=" + value.confirmPassword;
        return this.http.post('/auth/password-reset/', body, {
                headers: headers
            })
            .map(res => res.json());
    } 
    
    logout(token, password) {//have to pass in token and password as this object looses references when moving around app
        
        console.log('logout initiated'); 
        var authheader = new Headers(); 
        var body = '';
        authheader.append('Authorization', 'Bearer ' + token + ':' + password); 
        return this.http.post('/auth/logout/', body, {
                headers: authheader
            })
            .map((res : any) => {
                let data = res.json();                
                localStorage.removeItem('token');
                localStorage.removeItem('password');
                localStorage.removeItem('user_id');
            });
            //.map(res => res.json());         
    }
        
     
    //currently not used but can be used to get roles (authservice now handles checking if user is logged in)
    getSession(token, password) {
        console.log('getSession: Get Data');
        var authheader = new Headers(); 
        authheader.append('Authorization', 'Bearer ' + token + ':' + password); 
        return this.http.get('/auth/session/', {
            headers: authheader
        })
            .map(res => res.json());         
    }

    
      
    usernameCheck(username) {
        console.log('emailCheck: Get Data');
        var headers = new Headers();
        headers.append('Content-Type', 'application/json')
        return this.http.post('/api/check-username/', `{"username": "${username}"}`, {
                headers: headers
        })
        .map(res => res.json());
    }
    
    urlCheck(url) {
        console.log('urlCheck: Get Data');
        var headers = new Headers();
        headers.append('Content-Type', 'application/json')
        return this.http.post('/api/check-url/', `{"url": "${url}"}`, {
                headers: headers
        })
        .map(res => res.json());
    }
    
    emailCheck(email) {//SEEMS WE HAVE TO CHECK EMAIL AS WELL AS SUPERLOGIN FAILS IF USER HAS USED EMAIL BEFORE IT SEEMS JW

        console.log('emailCheck: Get Data');
        //alert('protocol used:' + window.location.protocol + 'host: ' + window.location.hostname)
        //var urlToUse = window.location.protocol + "//" + window.location.hostname + `:5984/profiles/_design/app/_view/profileByEmail?key="${email}"`
        //alert(urlToUse) return this.http.get(urlToUse)
        //return this.Jsonp.request(urlToUse)
        var headers = new Headers();
        headers.append('Content-Type', 'application/json')
       // headers.append('Content-Type', 'application/x-www-form-urlencoded');
        //var body = "email=" + email;
        //alert(body);
        return this.http.post('/api/check-email/', `{"email": "${email}"}`, {
                headers: headers
        })
        .map(res => res.json());
    }



}
