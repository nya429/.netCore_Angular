import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    private baseUrl: string;

    constructor(private authSerivce: AuthService,
        @Inject('BASE_URL') baseUrl: string) {
        this.baseUrl = baseUrl + 'api/';
    }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Exclude auth login 
        const re: RegExp = /login/gi;
        // console.log(req.url.search(re) === -1)
        if (req.url.search(re) === -1) {
            req = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json',
                    'Access-token': `Bearer ${this.authSerivce.getToken()}`,
                },
            });
        }
        /** @Todo Decide use intercept or other mechanism to handle error */
        // return next.handle(req).map((event: HttpEvent<any>) => {
        //     if (event instanceof HttpResponse) {
        //       // do stuff with response and headers you want
        //     }
        //     return event; 
        //   });
        return next.handle(req);
    }
}