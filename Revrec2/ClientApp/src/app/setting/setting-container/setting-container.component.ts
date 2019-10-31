import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-setting-container',
  templateUrl: './setting-container.component.html',
  styleUrls: ['./setting-container.component.css']
})
export class SettingContainerComponent implements OnInit {
  linkSettings = [{ segment: 'ratecards', description: 'Rate Cards' },
  { segment: 'ratecell-region-mappings', description: 'RateCell & Region Mappings' },
  { segment: 'discrepancy-statuses', description: 'Discrepancy Statuses' },
  { segment: 'discrepancy-categories', description: 'Discrepancy Categories' },
  { segment: 'users', description: 'Users' }];

  links = [];

  /** @input */
  activeLink;

  /** Authorization */
  listPermissionsRateCard: string;
  listPermissionsRateCellMap: string;
  listPermissionsRegionMap: string;
  listPermissionsDiscrepancyStatus: string;
  listPermissionsDiscrepancyCategory: string;
  listPermissionsUser: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.listPermissionsRateCard = this.authService.getRoleMappingSettingByNames('ratecard', 'GetRateCardListByConAsync');
    this.listPermissionsRateCellMap = this.authService.getRoleMappingSettingByNames('ratecellmap', 'GetRateCellMapListByConAsync');
    this.listPermissionsRegionMap = this.authService.getRoleMappingSettingByNames('regionmap', 'GetRegionMapListByConAsync');
    this.listPermissionsDiscrepancyStatus = this.authService.getRoleMappingSettingByNames('discrepancyStatues', 'GetDiscrepancyStatusesListByConAsync');
    this.listPermissionsDiscrepancyCategory = this.authService.getRoleMappingSettingByNames('discrepancyCateogry', 'GetDiscrepancyCategoryListByConAsync');
    this.listPermissionsUser = this.authService.getRoleMappingSettingByNames('user', 'GetUsersListByConAsync');
  }

  ngOnInit() {
    if (this.isAuthorized(this.listPermissionsRateCard)) {
      this.links.push(this.linkSettings[0])
    }

    if (this.isAuthorized(this.listPermissionsRateCellMap) || this.isAuthorized(this.listPermissionsRegionMap)) {
      this.links.push(this.linkSettings[1])
    }

    if (this.isAuthorized(this.listPermissionsDiscrepancyStatus)) {
      this.links.push(this.linkSettings[2])
    }

    if (this.isAuthorized(this.listPermissionsDiscrepancyCategory)) {
      this.links.push(this.linkSettings[3])
    }

    this.links.push(this.linkSettings[4])
    if (this.isAuthorized(this.listPermissionsUser)) {
    }

    this.activeLink = this.links[0].segment;
  }

  onNavigate(link) {
    this.activeLink = link;
  }

  isAuthorized(viewRoles: string) {
    return this.authService.isViewAuthorized(viewRoles);
  }
}
