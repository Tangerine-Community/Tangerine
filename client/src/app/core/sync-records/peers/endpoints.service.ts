import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {Endpoint} from './endpoint';

@Injectable({
  providedIn: 'root'
})
export class EndpointsService {

  window: any;
  endpoints: Endpoint[];

  constructor() {
    this.window = window;
  }

  initEndpoints(): Observable<Endpoint[]> {
    this.endpoints = [];
    return of(this.endpoints);
  }

  getPeers(): Observable<Endpoint[]> {
    return of(this.endpoints);
  }

}


