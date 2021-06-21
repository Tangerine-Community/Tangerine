import {AfterContentInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../shared/_services/user.service';
import {Endpoint} from './endpoint';
import {EndpointsService} from './endpoints.service';
import {PeersService} from '../_services/peers.service';
import {Message} from './message';

@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.css']
})
export class PeersComponent implements OnInit, AfterContentInit {

  @Input() endpoints: Endpoint[];
  window: any;
  ipAddress: String;
  port: String;
  @ViewChild('p2p', {static: true}) p2p: ElementRef;

  constructor(
    private endpointsService: EndpointsService,
    private readonly userService: UserService,
    private peersService: PeersService
  ) {
    this.window = window;
  }

  async ngOnInit() {
    this.endpoints = [];

    await this.getTangyP2PPermissions().then(async () => {
      await this.init().then(() => {
        this.endpointsService.initEndpoints()
          .subscribe(endpoints => this.endpoints = endpoints);
        console.log('ready');
      });
    });
  }

  async init() {
    this.endpoints = [];
    if (this.window.isCordovaApp) {
      if (window['cordova'].getAppVersion) {
        window['cordova'].getAppVersion.getVersionNumber().then(function (version) {
          document.querySelector('#p2p-results').innerHTML += 'App version: ' + version + '<br/>';
        });
      }
    }
  }

  ngAfterContentInit() {
    // const startAdvertisingBtnEl = this.p2p.nativeElement.querySelector('#startAdvertisingBtn');
    const startAdvertisingBtnEl = this.peersService.el;
    startAdvertisingBtnEl.addEventListener('log', e => {
        console.log('log message: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        const logEl = document.querySelector('#p2p-results');
        logEl.innerHTML = logEl.innerHTML +  '<p>' + message.message + '</p>\n';
      }
    );

    startAdvertisingBtnEl.addEventListener('localEndpointName', e => {
        console.log('localEndpointName: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        const el = document.querySelector('#localEndpointName');
        el.innerHTML =  '<p>This Device\'s Name: ' + message.message + '</p>\n';
      }
    );
    startAdvertisingBtnEl.addEventListener('endpoints', e => {
        console.log('endpoints: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        this.endpoints = message.object;
      }
    );
    startAdvertisingBtnEl.addEventListener('payload', e => {
        console.log('payload: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
        document.querySelector('#transferProgress').innerHTML = message.message + '<br/>';
      }
    );
    startAdvertisingBtnEl.addEventListener('progress', e => {
        // console.log('payload: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        if (typeof message.originName !== 'undefined') {
          this.endpoints = this.endpoints.map((endpoint) => {
            return endpoint.id === message.originName ? {...endpoint, status: message.message} : endpoint;
          });
        }
        if (typeof message.message !== 'undefined' && message.message.startsWith('onPayloadTransferUpdate')) {
          const progressObj = message.object;
          const bytesTransferred = progressObj['bytesTransferred'];
          const totalBytes = progressObj['totalBytes'];
          // TODO: originName is not the peer. Need the peer. originName is Master.
          const originName = progressObj['originName'];
          const endpointId = progressObj['endpointId'];
          let progressMessage = bytesTransferred + '/' + totalBytes + ' transferred';

          let directionString = ''
          if (!this.peersService.pushing) {
            document.querySelector('#direction').innerHTML = 'Receiving data' + '<br/>';
            directionString = 'from'
          } else {
            document.querySelector('#direction').innerHTML = 'Sending data' + '<br/>';
            directionString = 'to'
          }
          if (this.peersService.peer && this.peersService.peer.id && this.peersService.peer.id === endpointId) {
            const endpointName = this.peersService.peer.endpointName;
            progressMessage = bytesTransferred + '/' + totalBytes + ' transferred ' + directionString + ' ' + endpointName;
          }
          document.querySelector('#progress').innerHTML =  '<p>' + progressMessage + '</p>\n';
        }
        // document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
      }
    );
    startAdvertisingBtnEl.addEventListener('done', e => {
        console.log('Current peer sync complete: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        this.endpoints = this.endpoints.map((endpoint) => {
          return endpoint.id === message.destination ? {...endpoint, status: message.message} : endpoint;
        });
        document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
        document.querySelector('#transferProgress').innerHTML = message.message + '<br/>';
      }
    );
    startAdvertisingBtnEl.addEventListener('direction', e => {
        console.log('Direction: ' + JSON.stringify(e.detail));
        const message: Message = e.detail;
        document.querySelector('#direction').innerHTML = message.message + '<br/>';
      }
    );
    startAdvertisingBtnEl.addEventListener('error', e => {
      const message: Message = e.detail;
      const el: HTMLElement = document.querySelector('#p2p-errors');
      el.style.backgroundColor = 'pink';
      let errorMessage = '';
      if (typeof message.message !== 'undefined' && typeof message.message['message'] !== 'undefined' ) {
        errorMessage = message.message['message'];
      } else {
        errorMessage = JSON.stringify(message.message);
      }
      console.log('error: ' + errorMessage);
      el.innerHTML += errorMessage + '<br/>';
      }
    );
  }

  async getTangyP2PPermissions() {
    const response: Message = await this.peersService.getTangyP2PPermissions();
    if (typeof response !== 'undefined' && response['messageType'] === 'log') {
      const logEl = document.querySelector('#p2p-results');
      logEl.innerHTML = logEl.innerHTML +  '<p>' + response['message'] + '</p>\n';
    }
  }

  startAdvertising() {
    const startAdvertisingBtnEl = this.peersService.el;
    this.peersService.startAdvertising(this.endpoints);
  }

  async connectToEndpoint(id, name) {
    const endpointId = id + '~' + name;
    const message: Message = await this.peersService.connectToEndpoint(endpointId);
    this.endpoints = this.endpoints.map((endpoint) => {
      return endpoint.id === id ? {...endpoint, status: 'Sync\'d'} : endpoint;
    });
    if (typeof message !== 'undefined') {
      if (message.messageType === 'payloadReceived') {
        console.log('connectToEndpoint: payloadReceived');
        document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
        document.querySelector('#transferProgress').innerHTML += message.message + '<br/>';
      } else {
        document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
      }
    } else {
      document.querySelector('#p2p-results').innerHTML += 'No message upon resolution of connection.' + '<br/>';
    }

  }

  // async pushData() {
  //   await this.peersService.pushData();
  // }
}
