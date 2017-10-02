import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { environment } from './../../../../environments/environment';
@Injectable()
export class PolicyGuard implements CanActivate {
  securityPolicy = environment.securityPolicy;
  canActivate() {
    return true;
  }

}
