import { Injectable } from '@angular/core';
import {PeersComponent} from './peers.component';
import {Observable, of} from 'rxjs';
import {PEERS} from './mock-peers';
import {Peer} from './peer';
import {WindowRef} from '../../../shared/_services/window-ref.service';


@Injectable({
  providedIn: 'root'
})
export class PeersService {

  window: any;
  peers: Peer[];

  constructor(
    private windowRef: WindowRef
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  initPeers(): Observable<Peer[]> {
    // this.peers = PEERS;
    this.peers = [];
    return of(this.peers);
  }

  getPeers(): Observable<Peer[]> {
    return of(this.peers);
  }

  discoverPeers(): Observable<Peer[]> {
    // testing
    // const NEWPEERS: Peer[] =  [{deviceName: 'gamma', safePeerAddress: 'gammaSafe', peerAddress: 'gamma.Safe'}];
    // const peers = JSON.stringify(NEWPEERS);
    // this.addToPeers(peers);
    // return of(this.peers);
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].discoverPeers(null, (message) => {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
        this.addToPeers(message);
      }, (err) => {
        console.log('TangyP2P error:: ' + err);
        document.querySelector('#p2p-results').innerHTML += err + '<br/>';
      });
    }
    return of(this.peers);
  }

  private addToPeers(peers: string) {
    const peerDiv = document.querySelector('#p2p-peers')
    try {
      const peersArray = JSON.parse(peers)
      for (let peer of peersArray) {
        console.log(JSON.stringify(peer));
        // if (!this.peerList.includes(peer['deviceAddress'])) {
        //   this.peerList.push(peer['deviceAddress'])
        const peerAddress = peer['deviceAddress'];
        const safePeerAddress = peerAddress.replace(/:\s*/g, '_')
        peer.safePeerAddress = safePeerAddress;
        this.peers.push(peer);
        //
        // peerDiv.innerHTML += '<div class="peerItem"><button color="primary" mat-raised-button (click)="transferTo(\''
        //   + safePeerAddress + '\')">' + peer['deviceName'] + '</button><div class="peerResults" id="peer_'
        //   + safePeerAddress + '"></div></div>';
        // }
      }
    } catch (e) {
    }
  }

}


