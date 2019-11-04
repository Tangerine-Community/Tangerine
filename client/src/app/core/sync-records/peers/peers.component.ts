import {Component, Input, OnInit} from '@angular/core';
import {PeersService} from './peers.service';
import {UserService} from '../../../shared/_services/user.service';
import {Endpoint} from './endpoint';
import {EndpointsService} from './endpoints.service';
import {PeersService} from '../_services/peers.service';

@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.css']
})
export class PeersComponent implements OnInit {

  @Input() endpoints: Endpoint[];
  window: any;
  ipAddress: String;
  port: String;

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

  async getTangyP2PPermissions() {
    const response = this.peersService.getTangyP2PPermissions();
    if (response['messageType'] === 'log') {
      const logEl = document.querySelector('#p2p-results');
      logEl.innerHTML = logEl.innerHTML +  '<p>' + response['message'] + '</p>\n';
    }
  }

  async startAdvertising() {
    await this.peersService.startAdvertising(this.endpoints);
  }

  async connectToEndpoint(id, name) {
    const endpoint = id + '_' + name;
    await this.peersService.connectToEndpoint(endpoint);
  }

  async transferData() {
    await this.peersService.transferData();
  }
}
