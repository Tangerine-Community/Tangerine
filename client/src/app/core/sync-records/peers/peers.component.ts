import {Component, Input, OnInit} from '@angular/core';
import {Peer} from './peer';
import {PEERS} from './mock-peers';
import {PeersService} from './peers.service';
import {WindowRef} from '../../../shared/_services/window-ref.service';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.css']
})
export class PeersComponent implements OnInit {

  peer: Peer;
  selectedPeer: Peer;
  @Input() peers: Peer[];
  window: any;

  constructor(
    private peersService: PeersService,
    private windowRef: WindowRef
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  ngOnInit() {
    // setInterval(this.getTangyP2PPermissions, 3000);
    this.getTangyP2PPermissions().then(() => {
      this.init().then(() => {
        this.peersService.initPeers()
          .subscribe(peers => this.peers = peers);
        console.log('ready');
      });
    });
  }

  async transferTo(deviceAddress) {
    console.log('transfer to: ' + deviceAddress);
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].transferTo(deviceAddress, (message) => {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML = message + '<br/>';
        // document.querySelector('#peer_' + deviceAddress).innerHTML += message + '<br/>';
      });
    }
  }

  async onSelect(peer: Peer): Promise<void> {
    this.selectedPeer = peer;
    await this.transferTo(peer.safePeerAddress);
  }

  getPeers(): void {
    this.peersService.getPeers()
      .subscribe(peers => this.peers = peers);
  }

  async init() {
    if (this.window.isCordovaApp) {
      // window['TangyP2PPlugin'] = {};
      // let init = function (arg0, success, error) {
      //   // exec(success, error, 'TangyP2PPlugin', 'init', [arg0]);
      //   eval(success('boop'))
      // };
      // window['TangyP2PPlugin'].init = init;
      window['TangyP2PPlugin'].init(null, (message) => {
        console.log('Message: ' + message);
        // this.addToPeers(message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
      }, (err) => {
        console.log('TangyP2P error:: ' + err);
        document.querySelector('#p2p-results').innerHTML += err + '<br/>';
      });
    }
  }

  async startRegistration() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].startRegistration(null, (message) => {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
      }, (err) => {
        console.log('TangyP2P error:: ' + err);
        document.querySelector('#p2p-results').innerHTML += err + '<br/>';
      });
    }
  }

  async discoverPeers() {
   await this.peersService.discoverPeers()
     .subscribe(peers => {
       this.peers = peers;
       this.getPeers();
     });
  }



  async getTangyP2PPermissions() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].getPermission(null, function(message) {
        console.log('Message from getTangyP2PPermissions: ' + message);
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
      });
    }
  }

}
