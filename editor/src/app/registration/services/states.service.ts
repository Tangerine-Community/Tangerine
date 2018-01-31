import {Injectable} from '@angular/core';
//import {Http, Response, RequestOptions, Headers} from '@angular/http'; //import {Http, Response} from 'angular2/http';
import {Http, Response} from '@angular/http';
//import { Observable }     from 'rxjs/Observable';


@Injectable()
export class StatesService {
    

    constructor(public http: Http) {

    }

    getData() {
        console.log('states: Get Data');
        return this.http.get('/assets/states.json')
            .map(res => res.json());
    }

}
