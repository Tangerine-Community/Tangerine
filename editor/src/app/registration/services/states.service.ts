import {Injectable} from '@angular/core';
//import {Http, Response, RequestOptions, Headers} from '@angular/http'; //import {Http, Response} from 'angular2/http';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators'

//import { Observable }     from 'rxjs/Observable';


@Injectable()
export class StatesService {
    

    constructor(public http: HttpClient) {

    }

    getData() {
        console.log('states: Get Data');
        return this.http.get('/assets/states.json')
            .pipe(map(res => res));
    }

}
