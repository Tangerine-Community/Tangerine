import { Injectable } from '@angular/core';

import {Http, Response, Headers} from '@angular/http';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/take';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthService { 
  isLoggedIn: boolean = this._isLocalStorageUserIdSet();// default value is set to if user_id has a value (needed as if user refreshes server there is no default value would be false. User will be redirected to login even if set to true and they are not logged in)
  //private subject = new Subject<any>();

  private behaviorsubject = new BehaviorSubject<any>({loggedIn: this.isLoggedIn});//default value (ok if set to true on expired session as will handle redirect when subscribing if that value was not accurate in situations like session expireation or server restart.)
  //authInfo$: BehaviorSubject<any> = new BehaviorSubject<any>({loggedIn: this.isLoggedIn});
  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(public http: Http) {         
    }
    

    getSession(token, password) {
        console.log('getSession: Get Data');
        var authheader = new Headers(); 
        authheader.append('Authorization', 'Bearer ' + token + ':' + password); 
        return this.http.get('/auth/session/', {
            headers: authheader
        }).take(1)
            .map(res => res.json());         
    }  

    setLoggedIn() {
        this.isLoggedIn = true;//data is secured so this should be ok (purpose is only to update login status of header and redirect)
        this.behaviorsubject.next({ loggedIn: true });//this is read in header (app.component.html) as subscribed to this observable
        //this.authInfo$.next({ loggedIn: true });
    }

    setLoggedOut() {//used if on route and session has expired to ensure obeservable is updated
        this.isLoggedIn = false;//(not really needed)
        this.behaviorsubject.next({ loggedIn: false });
    }

    //used for app components header (router guard calls setLoggedIn if active session and if not logged in sets this to false)
    getLoginStatus(): Observable<any> {
        //return this.subject.asObservable();
        return this.behaviorsubject.asObservable();
        
    }

    private _isLocalStorageUserIdSet(): boolean {
        if(localStorage.getItem('user_id')) return true 
        else return false;
    }
    


}
