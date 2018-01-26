import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

@Injectable()
export class GroupsService {
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
    //note jw: http service in Angular 2.0 is using Observables not promises
    getGroups() {
       var authheader = new Headers(); 
       authheader.append('Authorization', 'Bearer ' + this.token + ':' + this.password); 
        //return this.http.get('/assets/users.json')
        //alert(this.user_id);
        return this.http.get('/api/groups/', {
            headers: authheader
        })
            .map(res => res.json());         
    }

}