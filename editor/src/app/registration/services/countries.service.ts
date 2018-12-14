import {Injectable} from '@angular/core';
//import {Http, Response, RequestOptions, Headers} from '@angular/http'; //import {Http, Response} from 'angular2/http';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators'
//import { Observable }     from 'rxjs/Observable';


@Injectable()
export class CountriesService {
    

    constructor(public http: HttpClient) {

    }

    getData() {
        console.log('countries: Get Data');
        return this.http.get('/assets/countries.json')
            .pipe(map(res => res));
    }

}
