import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';

@Component({
  selector: 'app-release-pwa',
  templateUrl: './release-pwa.component.html',
  styleUrls: ['./release-pwa.component.css']
})
export class ReleasePwaComponent implements OnInit {

  message = "Creating PWA...";
  id: string;
  sub: any;
  buildPwaIsComplete = false;
  secret = '';
  group = '';
  releaseType = '';

  constructor(
    private route: ActivatedRoute,
    private http: Http
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.group = params['id'];
      // @TODO Generate a secret.
      // this.secret = params['id'];
      this.releaseType = params['releaseType'];
      this.http.get(`/editor/release-pwa/${this.group}/${this.releaseType}`)
        .subscribe((data) => this.buildPwaIsComplete = true)
    });
  }

}
