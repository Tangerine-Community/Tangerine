import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APIInterceptor } from './auth-token-interceptor';

/** Http interceptor providers in outside-in order */
/**
 * Gotten from https://angular.io/guide/http#advanced-usage
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: APIInterceptor, multi: true },
];
