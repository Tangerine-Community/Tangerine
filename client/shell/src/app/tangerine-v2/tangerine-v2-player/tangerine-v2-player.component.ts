import { Component, OnInit, ViewChild, AfterContentInit } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-tangerine-v2-player',
  templateUrl: './tangerine-v2-player.component.html',
  styleUrls: ['./tangerine-v2-player.component.css']
})
export class TangerineV2PlayerComponent implements OnInit, AfterContentInit {

  iframeSrc: string;
  @ViewChild('iframe') iframeEl: any;


  constructor(private sanitizer: DomSanitizer) { 
    this.sanitizer.bypassSecurityTrustResourceUrl('/v2/index.html');
    //this.iframeSrc = 'v2/index.html';
    //this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:4200/index.html')
  }

  ngAfterContentInit() {
    debugger
    this.iframeEl.nativeElement.src = '/v2/index.html';

  }

  ngOnInit() {
  }

}
