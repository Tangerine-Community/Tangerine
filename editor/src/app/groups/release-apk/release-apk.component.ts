import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';

@Component({
  selector: 'app-release-apk',
  templateUrl: './release-apk.component.html',
  styleUrls: ['./release-apk.component.css']
})
export class ReleaseApkComponent implements OnInit {

  message = "Creating APK...";
  id: string;
  sub: any;
  buildApkIsComplete = false;
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
      this.secret = params['id'];
      this.releaseType = params['releaseType'];
      this.http.get(`/editor/release-apk/${this.secret}/${this.group}/${this.releaseType}`)
        .subscribe((data) => this.buildApkIsComplete = true)
    });
  }

}
