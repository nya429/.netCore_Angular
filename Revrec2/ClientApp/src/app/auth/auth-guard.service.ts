
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';
import { Observable, Subscription, of, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    userRoleReady: Subscription;

    constructor(private router: Router,
        private authService: AuthService) {
        console.log('AuthGuard Init')
    }

    canActivate(route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean | Subject<boolean> {

        const expectedRoles = route.data.expectedRoles;

        // console.log(state.url, route.data.expectedRoles, //pre-set
        //     this.authService.endpointRoleSetting,
        //     this.authService.actionUserRole, //expecting delayed for the first call
        //     this.authService.isViewAuthorized(expectedRoles))


        if (this.authService.actionUserRole) {
            console.log('sync called')
            if (this.authService.isAuthenticated() && this.authService.isViewAuthorized(expectedRoles)) {
                return state.url === '/auth/unauthroized' ? false : true;
            } else {
                // this.authService.changeSigninScale();
                this.router.navigate(['/auth/unauthroized']);
                return false;
            }
        } else {
            return new Observable(observer => {
                console.log('signinStateChanged subscribe')
                this.authService.signinStateChanged.subscribe((state: string) => {
                    console.log('state =', state)
                    if (state === ('authed') && this.authService.isViewAuthorized(expectedRoles)) {
                        observer.next(true);
                    } else {
                        observer.next(false);
                        this.router.navigate(['/auth/unauthroized']);
                    }
                })
            })
        }
    }
}