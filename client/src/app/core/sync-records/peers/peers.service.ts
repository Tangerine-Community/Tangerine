import { Injectable } from '@angular/core';
import {PeersComponent} from './peers.component';
import {Observable, of} from 'rxjs';
import {PEERS} from './mock-peers';
import {Peer} from './peer';
import {WindowRef} from '../../../shared/_services/window-ref.service';
import {Device} from './device';


@Injectable({
  providedIn: 'root'
})
export class PeersService {

  window: any;
  peers: Peer[];
  device: Device;

  constructor(
    private windowRef: WindowRef
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  initPeers(): Observable<Peer[]> {
    this.peers = [];
    // this.peers = PEERS;
    return of(this.peers);
  }

  getPeers(): Observable<Peer[]> {
    return of(this.peers);
  }

  discoverPeers(): Observable<Peer[]> {
    // testing
    // const NEWPEERS: Peer[] =  [{deviceName: 'gamma', safePeerAddress: 'gammaSafe', deviceAddress: 'gamma.Safe'}, {deviceName: 'hooha', safePeerAddress: 'hoohaSafe', deviceAddress: 'hooha.Safe'}];
    // const peers = JSON.stringify(NEWPEERS);
    // this.addToUI(peers);
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].discoverPeers(null, (message) => {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
        this.addToUI(message);
      }, (err) => {
        console.log('TangyP2P error:: ' + err);
        document.querySelector('#p2p-results').innerHTML += err + '<br/>';
      });
    }
    return of(this.peers);
  }

  private addToUI(message: string) {
    try {
      const messageJson = JSON.parse(message)
      if (typeof messageJson['type'] !== 'undefined') {
        if (messageJson['type'] === 'self') {
          this.device = messageJson;
        } else if (messageJson['type'] === 'peers') {
          // ok we'd need to make some changes how we send over the data, so we won't use this yet.
        }
      } else {
        // this.peers = [];
        for (let peer of messageJson) {
          console.log('peer: ' + JSON.stringify(peer));
          if (this.peers.length === 0 || !this.peers.some(currentPeer => (currentPeer.deviceAddress === peer.deviceAddress))) {
            const deviceAddress = peer['deviceAddress'];
            const safePeerAddress = deviceAddress.replace(/:\s*/g, '_')
            peer.safePeerAddress = safePeerAddress;
            this.peers.push(peer);
          }
        }
      }
    } catch (e) {
    }
  }
}


