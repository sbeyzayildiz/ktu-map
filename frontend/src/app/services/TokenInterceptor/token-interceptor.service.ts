import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class TokenIntercepterService implements HttpInterceptor {

  constructor(private router: Router) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      // setHeaders: {
      //   Authorization: `Bearer ${window.localStorage.getItem('token')}`
      // }
      setParams: {
        token: window.localStorage.getItem('token')
      }
    });
    return next.handle(req);
  }
}