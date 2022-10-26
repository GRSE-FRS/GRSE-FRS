import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService {

  constructor(
    private injector: Injector,
    private spinner: NgxSpinnerService,
  ) { }

  intercept(req: any, next: any): Observable<any> {
    let authService = this.injector.get(AuthService);
    let tokenizedReq = req.clone({
      setHeaders: {
        'token': `${authService.getToken()}`
      }
    })

    return next.handle(tokenizedReq);
  }
}
