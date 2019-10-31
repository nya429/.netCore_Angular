import { AuthService } from './auth/auth.service';
import { Injectable } from '@angular/core';
import { SettingService } from './setting/setting.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public signInStateChanged = new Subject<any>();
  public optionInited = new Subject<any>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private settingService: SettingService) { }

  init() {
    this.authService.autoLoginViaWinAuth();
    /** TODO temp init options regardless auth result */

    this.authService.signinStateChanged.subscribe((authResult: string) => {
      /** TODO temp init all */
      switch (authResult) {
        case "authed":
          this.signInStateChanged.next(authResult);
          this.authService.getAppRoleMappingSettings();

          break;
        case "failed":
          this.signInStateChanged.next(authResult);
          this.router.navigate(['auth/unauthroized']);
          break;
        default:
          this.signInStateChanged.next(authResult);
          this.router.navigate(['auth/unauthorized']);
          break;
      }
    })


    this.authService.endpointroleSettingReady.subscribe(() => {
      this.settingService.initOpionts();
    });

    this.settingService.optionsReady$.subscribe(() => {
      this.optionInited.next();
    })

  }
}
