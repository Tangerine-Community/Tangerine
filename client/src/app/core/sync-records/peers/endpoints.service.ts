import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {WindowRef} from '../../../shared/_services/window-ref.service';
import {Endpoint} from './endpoint';

@Injectable({
  providedIn: 'root'
})
export class EndpointsService {

  window: any;
  endpoints: Endpoint[];

  constructor(
    private windowRef: WindowRef
  ) {
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


