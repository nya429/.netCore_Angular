import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit, OnDestroy {
  @Output() closeSidenav = new EventEmitter<void>();
  @Input() xsMatched: boolean;


  /** Nav Authorization */
  listPermissionMember: string = '0000';
  listPermissionDiscrepancy: string = '0000';

  ngOnInit() {
    console.log('here')

    this.authService.endpointroleSettingReady.subscribe(() => {
      console.log('here')
      this.listPermissionDiscrepancy = this.authService.getRoleMappingSettingByNames('discrepancy', 'GetDiscrepancyRecordListByConAsync');
      this.listPermissionMember = this.authService.getRoleMappingSettingByNames('member', 'GetMemberListByConAsync');
    })
  }

  constructor(private authService: AuthService) {

  }

  ngOnDestroy(): void {

  }

  onClose() {
    if (!this.xsMatched) {
      //  this.closeSidenav.emit();
    }
  }

  isAuth() {
    return this.authService.isAuthenticated();
  }

  isAuthorized(view: string) {
    switch (view) {
      case "member":
        return this.authService.isViewAuthorized(this.listPermissionMember);
      case "discrepancy":
        return this.authService.isViewAuthorized(this.listPermissionDiscrepancy);
      default:
        return false;
    }
  }
}
