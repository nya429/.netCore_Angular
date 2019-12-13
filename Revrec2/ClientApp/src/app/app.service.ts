import { NotificationService } from './notification.service';
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

  /** Setting Authorization */
  listPermissionsRateCard: string;
  listPermissionsRateCellMap: string;
  listPermissionsRegionMap: string;
  listPermissionsDiscrepancyStatus: string;
  listPermissionsDiscrepancyCategory: string;
  listPermissionsUser: string;
  settingLinks = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private settingService: SettingService,
    private notificationService: NotificationService) { }

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
          this.router.navigate(['unauthroized']);
          break;
        default:
          this.signInStateChanged.next(authResult);
          this.router.navigate(['unauthorized']);
          break;
      }
    })


    this.authService.endpointroleSettingReady.subscribe(() => {
      this.settingService.initOpionts();
      this.configWildCardRoute();
    });
    
    this.settingService.optionsReady$.subscribe(() => {
      let userId = this.authService.getActionUserId();
      console.log(userId);
      this.notificationService.subscribeNotification(userId);
      this.optionInited.next();
    })
  }

  configWildCardRoute() {
    const linkSettings = [{ segment: 'ratecards', description: 'Rate Cards' },
    { segment: 'ratecell-region-mappings', description: 'Rate Cell & Region Mappings' },
    { segment: 'discrepancy-statuses', description: 'Discrepancy Statuses' },
    { segment: 'discrepancy-categories', description: 'Discrepancy Categories' },
    { segment: 'users', description: 'Users' }];

    this.listPermissionsRateCard = this.authService.getRoleMappingSettingByNames('ratecard', 'GetRateCardListByConAsync');
    this.listPermissionsRateCellMap = this.authService.getRoleMappingSettingByNames('ratecellmap', 'GetRateCellMapListByConAsync');
    this.listPermissionsRegionMap = this.authService.getRoleMappingSettingByNames('regionmap', 'GetRegionMapListByConAsync');
    this.listPermissionsDiscrepancyStatus = this.authService.getRoleMappingSettingByNames('discrepancyStatues', 'GetDiscrepancyStatusesListByConAsync');
    this.listPermissionsDiscrepancyCategory = this.authService.getRoleMappingSettingByNames('discrepancyCateogry', 'GetDiscrepancyCategoryListByConAsync');
    this.listPermissionsUser = this.authService.getRoleMappingSettingByNames('user', 'GetUsersListByConAsync');
   
    if (this.authService.isViewAuthorized(this.listPermissionsRateCard)) {
      this.settingLinks.push(linkSettings[0])
    }

    if (this.authService.isViewAuthorized(this.listPermissionsRateCellMap) || this.authService.isViewAuthorized(this.listPermissionsRegionMap)) {
      this.settingLinks.push(linkSettings[1])
    }

    if (this.authService.isViewAuthorized(this.listPermissionsDiscrepancyStatus)) {
      this.settingLinks.push(linkSettings[2])
    }

    if (this.authService.isViewAuthorized(this.listPermissionsDiscrepancyCategory)) {
      this.settingLinks.push(linkSettings[3])
    }

    if (this.authService.isViewAuthorized(this.listPermissionsUser)) {
      this.settingLinks.push(linkSettings[4])
    }

    let activeLink = this.settingLinks.length ? this.settingLinks[0].segment : '';

    if (activeLink) {
      this.router.config.find(c => c.path === "settings").children.push(
        { path: "", redirectTo: activeLink, pathMatch: 'full' }
      );
    }

    console.log( this.router.config)
  }

  getSettingLinks = () => this.settingLinks;
}
