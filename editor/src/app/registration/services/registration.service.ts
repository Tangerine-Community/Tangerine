import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { map } from 'rxjs/operators'

@Injectable()
export class RegistrationService {
    result: Object;
    error: Object;
    loginObj: Object;
    
    
    constructor(public http: HttpClient) {          //, public Jsonp: Jsonp
    }
    
    //note jw: http service in Angular 2.0 is using Observables not promises
    registerUser(value) {
        console.log('registering user started');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json')
        var body = JSON.stringify(value);
        return this.http.post('/api/users/',
            body, {
                headers: headers
            })
            .pipe(map(res => res));
    }

    loginUser(value) {
        console.log('login page: Post');
        var headers = new HttpHeaders();
        var authheader = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "username=" + value.username + "&password=" + value.password;
        return this.http.post('/login', body, {
                headers: headers
            })
            .pipe(map((res : any) => {//this only runs if you get the actual data and not on error
                let data = res.json();
                // @TODO Still need these items?
                localStorage.setItem('token', data.name);
                localStorage.setItem('user_id', data.name);
                localStorage.setItem('password', data.status);

                authheader.append('Authorization', 'Bearer ' + data.token + ':' + data.password); 

            }))
            //.flatMap((res) => //here we make another call to server to check if user has ever logged in and 
            //ensure we log that user has logged. The status of this call is basis for what page they see when logging in.
                /*
                this.http.post('/api/trackLogin/', body2, {
                    headers: authheader}).map((res : any) => {
                    let data = res.json();
                    return data;
                })
                */
            //);
            //.map(res => res.json());
    }
    
    retrievePW(value) {
        console.log('password page: Post');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "email=" + value.email;
        return this.http.post('/auth/forgot-password/', body, {
                headers: headers
            })
            .pipe(map(res => res))
    }

    retrieveID(value) {
        console.log('username page: Post');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "email=" + value.email;
        return this.http.post('/api/email-username', body, {
                headers: headers
            })
            .pipe(map(res => res));
    }
    
    changePW(value) {
        console.log('password reset page: Post');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var body = "token=" +value.token + "&password=" + value.password  + "&confirmPassword=" + value.confirmPassword;
        return this.http.post('/auth/password-reset/', body, {
                headers: headers
            })
            .pipe(map(res => res));
    } 
    
    logout(token, password) {//have to pass in token and password as this object looses references when moving around app
        
        console.log('logout initiated'); 
        var authheader = new HttpHeaders(); 
        var body = '';
        authheader.append('Authorization', 'Bearer ' + token + ':' + password); 
        return this.http.post('/auth/logout/', body, {
                headers: authheader
            })
            .pipe(map((res : any) => {
                let data = res.json();                
                localStorage.removeItem('token');
                localStorage.removeItem('password');
                localStorage.removeItem('user_id');
            }));
            //.map(res => res.json());         
    }
        
     
    //currently not used but can be used to get roles (authservice now handles checking if user is logged in)
    getSession(token, password) {
        console.log('getSession: Get Data');
        var authheader = new HttpHeaders(); 
        authheader.append('Authorization', 'Bearer ' + token + ':' + password); 
        return this.http.get('/auth/session/', {
            headers: authheader
        })
            .pipe(map(res => res));         
    }

    
      
    usernameCheck(username) {
        console.log('emailCheck: Get Data');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json')
        return this.http.post('/api/check-username/', `{"username": "${username}"}`, {
                headers: headers
        })
        .pipe(map(res => res));
    }
    
    urlCheck(url) {
        console.log('urlCheck: Get Data');
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json')
        return this.http.post('/api/check-url/', `{"url": "${url}"}`, {
                headers: headers
        })
        .pipe(map(res => res));
    }
    
    emailCheck(email) {//SEEMS WE HAVE TO CHECK EMAIL AS WELL AS SUPERLOGIN FAILS IF USER HAS USED EMAIL BEFORE IT SEEMS JW

        console.log('emailCheck: Get Data');
        //alert('protocol used:' + window.location.protocol + 'host: ' + window.location.hostname)
        //var urlToUse = window.location.protocol + "//" + window.location.hostname + `:5984/profiles/_design/app/_view/profileByEmail?key="${email}"`
        //alert(urlToUse) return this.http.get(urlToUse)
        //return this.Jsonp.request(urlToUse)
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json')
       // headers.append('Content-Type', 'application/x-www-form-urlencoded');
        //var body = "email=" + email;
        //alert(body);
        return this.http.post('/api/check-email/', `{"email": "${email}"}`, {
                headers: headers
        })
        .pipe(map(res => res));
    }



}
