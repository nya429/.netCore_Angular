import { User, Roles, EndpointRoleMap } from 'src/app/model/user.model';
import { Subject, Observable, of } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { resolve } from 'url';
import { Response } from '../model/response.model';
import * as jwt_decode from "jwt-decode";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private baseUrl: string;
    token = null;
    signinStateChanged = new Subject<any>();
    actionUser: User;
    actionUserRole: string;

    endpointRoleSetting: EndpointRoleMap = null;
    endpointroleSettingReady = new Subject<any>();

    constructor(private httpClient: HttpClient,
        private router: Router,
        @Inject('BASE_URL') baseUrl: string) {
        this.baseUrl = baseUrl + 'api/';
    }

    autoLoginViaWinAuth() {
        const url = this.baseUrl + 'auth/login';
        console.log("GET /auth/login")
        return this.httpClient.get<Response<any>>(url, {
            observe: 'body',
            responseType: 'json',
        }).subscribe(result => {
            if (result.isSuccess) {
                this.token = result.data['token'];
                this.actionUser = result.data['userInfo'];
                this.getActionUserRole();
                console.log("GET /auth/login => Authed", result.data)
                this.signinStateChanged.next('authed')
            } else {
                console.error('GET /auth/login => failed', result.data);
                this.signinStateChanged.next('failed')
            }
        }, (err: HttpErrorResponse) => {
            this.signinStateChanged.next('failed');
            console.error('GET /auth/login => failed', err);
            this.actionUser = null;
            this.token = null;
        });
    }

    getAppRoleMappingSettings() {
        const url = this.baseUrl + 'auth/settings';
        console.log("GET /auth/settings")
        return this.httpClient.get<Response<EndpointRoleMap>>(url, {
            observe: 'body',
            responseType: 'json',
        }).subscribe(result => {
            if (result.isSuccess) {
                this.endpointRoleSetting = result.data;
                console.log("GET /auth/settings => ", this.endpointRoleSetting)
                this.endpointroleSettingReady.next();
            }
        }, (err: HttpErrorResponse) => {
            this.signinStateChanged.next('failed');
            console.error('GET /auth/settings =>', err);
            this.actionUser = null;
            this.token = null;
        });
    }

    getRoleMappingSettingByNames(moduleName: string, viewName: string) {
        return this.endpointRoleSetting.module.find(m => m.name === moduleName).endpoint.find(e => e.name === viewName).value;
    }

    logoutUser() {
        this.token = null;
        this.actionUser = null;
        this.router.navigate(['auth/login']);
    }

    getToken() {
        //  return 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJTb25nIFNvbmciLCJlbWFpbCI6Inlzb25nQGNvbW1vbndlYWx0aGNhcmUub3JnIiwibmJmIjoxNTY5OTYyMTY4LCJleHAiOjE1NzAwNDg1NjgsImlhdCI6MTU2OTk2MjE2OH0.z2uAYo6uqUZzTcEbu0yPPOSctLIJHniKVSpcwuX2DEvf6Okfpth0p5MTvMJffnlIvH6RFC70ZG3yfDkZB5WeOA'
        return this.token;
    }

    /** TODO add JWT parser */
    isAuthenticated() {
        // return true;
        return this.token !== null;

    }

    getActionUser() {
        return this.actionUser;
    }

    getActionUserId() {
        // console.log('getActionUserId', this.actionUser)
        return this.actionUser ? this.actionUser.userID : 0;
    }

    changeSigninScale() {
        this.signinStateChanged.next('fail');
    }

    isViewAuthorized(permittedRoles: string): boolean {
        return (parseInt(this.actionUserRole, 2) & parseInt(permittedRoles, 2)) > 0;
    }

    isViewAuthorizedAync(permittedRoles: string): Observable<boolean> {
        return new Observable(observer => {
            this.signinStateChanged.subscribe((state: string) => {
                if (state === ('authed')) {
                    observer.next(this.isViewAuthorized(permittedRoles));
                } else {
                    observer.next(false);
                }
            })
        })
    }

    getActionUserRole() {
        try {
            const payload = jwt_decode(this.token);
            this.actionUserRole = payload.role;
        }
        catch (Error) {
            this.actionUserRole = "0";
            return null;
        }
    }

    signupUser(signupForm) {
        return this.httpClient.post(`http://localhost:5000/register`, signupForm, {
            observe: 'body',
            responseType: 'json',
        })
            .subscribe(
                (result) => {
                    this.token = result['access_token'];
                    this.signinStateChanged.next('authed');
                }, (err: HttpErrorResponse) => {
                    console.error(err);
                    this.token = null;
                    this.signinStateChanged.next('fail');
                }
            );
    }

    signinUser(signupForm) {
        return this.httpClient.post(`http://localhost:5000/auth`, signupForm, {
            observe: 'body',
            responseType: 'json',
        })
            .subscribe(
                (result) => {
                    //   this.router.navigate(['/members']);
                    this.token = result['access_token'];
                    this.signinStateChanged.next('authed');
                }, (err: HttpErrorResponse) => {
                    console.error(err);
                    this.token = null;
                    this.signinStateChanged.next('fail');
                }
            );
    }

}