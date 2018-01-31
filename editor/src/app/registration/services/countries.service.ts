import {Injectable} from '@angular/core';
//import {Http, Response, RequestOptions, Headers} from '@angular/http'; //import {Http, Response} from 'angular2/http';
import {Http, Response} from '@angular/http';
//import { Observable }     from 'rxjs/Observable';


@Injectable()
export class CountriesService {
    

    constructor(public http: Http) {

    }

    getData() {
        console.log('countries: Get Data');
        return this.http.get('/assets/countries.json')
            .map(res => res.json());
    }

}
