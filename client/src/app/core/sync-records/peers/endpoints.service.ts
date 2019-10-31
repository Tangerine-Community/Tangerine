import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {WindowRef} from '../../../shared/_services/window-ref.service';
import {Device} from './device';
import {Endpoint} from './endpoint';

@Injectable({
  providedIn: 'root'
})
export class EndpointsService {

  window: any;
  endpoints: Endpoint[];
  device: Device;

  constructor(
    private windowRef: WindowRef
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  initEndpoints(): Observable<Endpoint[]> {
    this.endpoints = [];
    return of(this.endpoints);
  }

  getPeers(): Observable<Endpoint[]> {
    return of(this.endpoints);
  }

}


