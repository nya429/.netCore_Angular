import { NotificationService } from './notification.service';
import { AuthService } from './auth/auth.service';
import { Injectable } from '@angular/core';
import { SettingService } from './setting/setting.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { take, first } from 'rxjs/operators';
import { Link, EndpointSetting, LinkEndpointMap, LinkSettings, LinkReports } from './auth/auth.endpoint';



@Injectable({
  providedIn: 'root'
})
export class AppService {
  public signInStateChanged = new Subject<any>();
  public optionInited = new Subject<any>();

  /** Setting Authorization */
  // listPermissionsRateCard: string;
  // listPermissionsRateCellMap: string;
  // listPermissionsRegionMap: string;
  // listPermissionsDiscrepancyStatus: string;
  // listPermissionsDiscrepancyCategory: string;
  // listPermissionsUser: string;

  private settingLinks = [] as Link[];
  private reportLinks = [] as Link[];


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
      this.configWildCardRoutes();
    });

    this.settingService.optionsReady$.pipe(first()).subscribe(() => {
      let userId = this.authService.getActionUserId();
      this.notificationService.subscribeNotification(userId);
      this.optionInited.next();
    })
  }

  // configWildCardRoute2() {
  //   const linkSettings = [{ segment: 'ratecards', description: 'Rate Cards' },
  //   { segment: 'ratecell-region-mappings', description: 'Rate Cell & Region Mappings' },
  //   { segment: 'discrepancy-statuses', description: 'Discrepancy Statuses' },
  //   { segment: 'discrepancy-categories', description: 'Discrepancy Categories' },
  //   { segment: 'users', description: 'Users' }];

  //   const linkReports = [{ segment: 'operational', description: 'Operational' },
  //   { segment: 'financial', description: 'Financial' },
  //   { segment: 'productivity', description: 'Productivity' },
  //   { segment: 'gdp', description: 'Revrec 1.0 Story' }];


  //   this.listPermissionsRateCard = this.authService.getRoleMappingSettingByNames('ratecard', 'GetRateCardListByConAsync');
  //   this.listPermissionsRateCellMap = this.authService.getRoleMappingSettingByNames('ratecellmap', 'GetRateCellMapListByConAsync');
  //   this.listPermissionsRegionMap = this.authService.getRoleMappingSettingByNames('regionmap', 'GetRegionMapListByConAsync');
  //   this.listPermissionsDiscrepancyStatus = this.authService.getRoleMappingSettingByNames('discrepancyStatues', 'GetDiscrepancyStatusesListByConAsync');
  //   this.listPermissionsDiscrepancyCategory = this.authService.getRoleMappingSettingByNames('discrepancyCateogry', 'GetDiscrepancyCategoryListByConAsync');
  //   this.listPermissionsUser = this.authService.getRoleMappingSettingByNames('user', 'GetUsersListByConAsync');

  //   if (this.authService.isViewAuthorized(this.listPermissionsRateCard)) {
  //     this.settingLinks.push(linkSettings[0])
  //   }

  //   if (this.authService.isViewAuthorized(this.listPermissionsRateCellMap) || this.authService.isViewAuthorized(this.listPermissionsRegionMap)) {
  //     this.settingLinks.push(linkSettings[1])
  //   }

  //   if (this.authService.isViewAuthorized(this.listPermissionsDiscrepancyStatus)) {
  //     this.settingLinks.push(linkSettings[2])
  //   }

  //   if (this.authService.isViewAuthorized(this.listPermissionsDiscrepancyCategory)) {
  //     this.settingLinks.push(linkSettings[3])
  //   }

  //   if (this.authService.isViewAuthorized(this.listPermissionsUser)) {
  //     this.settingLinks.push(linkSettings[4])
  //   }

  //   let activeLink = this.settingLinks.length ? this.settingLinks[0].segment : '';
  //   console.log(this.settingLinks)
  //   return;
  //   if (activeLink) {
  //     this.router.config.find(c => c.path === "settings").children.push(
  //       { path: "", redirectTo: activeLink, pathMatch: 'full' }
  //     );
  //   }

  //   console.log(this.router.config)
  // }

  configWildCardRoutes() {
    const linkReports = LinkReports;
    const linkSettings = LinkSettings;

    this.configWildCardRoute(this.reportLinks, linkReports, 'reports')
    this.configWildCardRoute(this.settingLinks, linkSettings, 'settings')

    console.log(this.router.config)
  }

  configWildCardRoute(links: Link[], linkMaps: LinkEndpointMap[], modulePath: string) {
    linkMaps.forEach(linkMap => {
      let isPermitted = true;
      if (linkMap.endpointSettings.length > 0)
        isPermitted = linkMap.endpointSettings.map((endpointPermission: EndpointSetting) => {
          const roleMappingSetting = this.authService.getRoleMappingSettingByNames(endpointPermission.module, endpointPermission.endpoint)
          return this.authService.isViewAuthorized(roleMappingSetting);
        }).reduce((acc, cur) => cur || acc, false);

      if (isPermitted) {
        links.push(linkMap.link);
      }
    });

    const activeLink = links.length ? links[0].segment : '';

    if (activeLink) {
      this.router.config.find(c => c.path === modulePath).children.push(
        { path: "", redirectTo: activeLink, pathMatch: 'full' }
      );
    }
  }


  getSettingLinks = () => this.settingLinks;

  getReportLinks = () => this.reportLinks;
}
