import {Component, Input, OnInit} from '@angular/core';
import {Peer} from './peer';
import {Device} from './device';
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
  ipAddress: String;
  port: String;
  @Input() device: Device;

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

  async onSelect(peer: Peer): Promise<void> {
    this.selectedPeer = peer;
    await this.transferTo(peer.safePeerAddress);
  }

  getPeers(): void {
    this.peersService.getPeers()
      .subscribe(peers => this.peers = peers);
  }

  async init() {
    this.peers = [];
    if (this.window.isCordovaApp) {

      // window['webserver'].onRequest(
      //   function(request) {
      //     console.log('O MA GAWD! This is the request: ', request);
      //
      //     window['webserver'].sendResponse(
      //       request.requestId,
      //       {
      //         status: 200,
      //         body: '<html>Hello World out there</html>',
      //         headers: {
      //           'Content-Type': 'text/html'
      //         }
      //       }
      //     );
      //   }
      // );
      //
      // window['webserver'].start();
      // window.cordova.getAppVersion.getVersionNumber()
      if (window['cordova'].getAppVersion) {
        window['cordova'].getAppVersion.getVersionNumber().then(function (version) {
          document.querySelector('#p2p-results').innerHTML += 'App version: ' + version + '<br/>';
        });
      }
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

  async startAdvertising() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].startAdvertising(null, function(message) {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
      });
    }
  }

  async startDiscovery() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].startDiscovery(null, function(message) {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
      });
    }
  }

  async transferData() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].transferData(null, function(message) {
        console.log('Message: ' + message);
        document.querySelector('#p2p-results').innerHTML += message + '<br/>';
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
      });
    }
  }

}
