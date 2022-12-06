/**
 * Adapted from https://stackoverflow.com/questions/45735655/how-do-i-set-the-baseurl-for-angular-httpclient
 */
import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import { AuthenticationService } from '../../auth/_services/authentication.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const apiReq = token
    ? req.clone({ url: `${req.url}` , headers: req.headers.set('Authorization', token) })
    : req.clone({ url: `${req.url}` });
    return next.handle(apiReq).pipe( tap(() => {},
    (err: any) => {
    if (err instanceof HttpErrorResponse) {
      if (err.status !== 401) {
       return;
      }
      this.authenticationService.logout();
    }
  }));
  }
}
