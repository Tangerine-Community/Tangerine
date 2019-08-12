import {Component, Input, OnInit} from '@angular/core';
import {Peer} from './peer';
import {Device} from './device';
import {PEERS} from './mock-peers';
import {PeersService} from './peers.service';
import {WindowRef} from '../../../shared/_services/window-ref.service';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import PouchDB from 'pouchdb';
import {UserService} from "../../../shared/_services/user.service";

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
    private readonly userService: UserService,
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

  // async onSelect(peer: Peer): Promise<void> {
  //   this.selectedPeer = peer;
  //   await this.transferTo(peer.safePeerAddress);
  // }

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
        try {
          const messageJson = JSON.parse(message)
        } catch (e) {
          console.log('Message: ' + message);
          document.querySelector('#p2p-results').innerHTML += message + '<br/>';
        }
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
      });
    }
  }

  async listenForTransfer() {
    if (this.window.isCordovaApp) {
      window['TangyP2PPlugin'].listenForTransfer(null, (message) => {
        if (message.startsWith('{"version":')) {
          PouchDB.plugin(window['PouchReplicationStream'].plugin);
          PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
          // const stream = new window['Memorystream'](message);
          const writeStream =  new window['Memorystream']
          writeStream.end(message);
          const username = this.userService.getCurrentUser()
          const dest = new PouchDB(username);
          const pluginMessage = 'I loaded data from the peer device.'
          dest.load(writeStream).then(function () {
            document.querySelector('#p2p-results').innerHTML += pluginMessage + '<br/>';
          }).catch(function (err) {
            message = 'oh no an error: ' + err
            console.log(message);
            document.querySelector('#p2p-results').innerHTML += message + '<br/>';
          });
        } else {
          console.log('Message: ' + message);
          document.querySelector('#p2p-results').innerHTML += message + '<br/>';
        }
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
      PouchDB.plugin(window['PouchReplicationStream'].plugin);
      PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
      let dumpedString = '';
      const stream = new window['Memorystream']();
      stream.on('data', function(chunk) {
        dumpedString += chunk.toString();
      });
      const username = this.userService.getCurrentUser()
      const source = new PouchDB(username);
      source.dump(stream).then(function () {
        // console.log('Yay, I have a dumpedString: ' + dumpedString);
        window['TangyP2PPlugin'].transferData(dumpedString, function(message) {
          console.log('Message: ' + message);
          document.querySelector('#p2p-results').innerHTML += message + '<br/>';
        }, function(err) {
          console.log('TangyP2P error:: ' + err);
        });
      }).catch(function (err) {
        console.log('oh no an error', err);
      });


    }
  }

}
