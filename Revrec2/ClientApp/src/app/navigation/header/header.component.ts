import { NotificationService } from './../../notification.service';
import { Notification } from './../../model/notification.model';
import { AppService } from './../../app.service';
import { NavigationService } from './../navigation.service';
import { AssignmentService } from './../../assignment/assignment.service';
import { SharedService } from './../../shared/shared.service';
import { MemberService } from 'src/app/member/member.service';
import { ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/model/user.model';
import { universalSearchTrigger } from '../navigation.animation';
import { FormGroup, FormControl } from '@angular/forms';
import { execLenValidator, minLenValidator } from 'src/app/shared/date.validate.directive';
import { initTransferState } from '@angular/platform-browser/src/browser/transfer_state';
import { Subscription } from 'rxjs';
import { MemberName } from 'src/app/model/member.model';
import { SettingService } from 'src/app/setting/setting.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [universalSearchTrigger]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidenavToggle = new EventEmitter<void>();
  @ViewChild('usInputRef') usInputRef: ElementRef;
  bread: string;

  /** universal search state */
  inputActive: boolean = false;
  searchForm: FormGroup;
  searchTimer: any;
  searchLoading: boolean = false;
  searchForm$: Subscription;
  memebrNamePartailFetched$: Subscription;
  router$: Subscription;
  memebrNameResults: MemberName[];
  searchHistory: MemberName[];

  /** Notification Object */
  notificationAlert$: Subscription;
  notifications: Notification[];
  alertList: Notification[];

  constructor(private authService: AuthService,
    private navService: NavigationService,
    private notificationService: NotificationService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute, ) {
    this.notifications = [];
    this.alertList = [];
  }

  ngOnInit(): void {
    /** Are we using this anymore? */
    // this.getChildRoute();
    this.initForm();
    this.initState();
  }

  ngOnDestroy() {
    this.searchForm$.unsubscribe();
    this.router$.unsubscribe();
    this.memebrNamePartailFetched$.unsubscribe();
    clearTimeout(this.searchTimer);
  }

  isAuthed() {
    return this.authService.isAuthenticated();
  }

  initForm() {
    this.searchForm = new FormGroup({
      universalInput: new FormControl('', {
        validators: minLenValidator(3)
      }),
      Name: new FormControl('', {
        validators: minLenValidator(3)
      }),
      CCAID: new FormControl('', {
        validators: execLenValidator(10)
      }),
      MMIS_ID: new FormControl('', {
        validators: execLenValidator(12)
      }),
    });
  }

  initState() {
    /** Are we using this anymore? */
    // this.router$ = this.router.events.pipe(
    //   filter((event: Event) => event instanceof NavigationEnd),
    // ).subscribe(() => {
    //   this.getChildRoute()
    // });

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.onSearch();
    });

    this.notificationAlert$ = this.notificationService.notificatonAlerted.subscribe((notification: Notification[]) => {
      console.log(  this.alertList,this.notifications);
      if (notification) {
        console.log("ALERT", notification);
        
        this.notifications = this.notifications.concat(notification);
        this.alertList = this.alertList.concat(notification)
        this.alertList.sort((b, a) => new Date(a.EntryTime).getTime() - new Date(b.EntryTime).getTime());
        console.log(  this.alertList,this.notifications);
      }
    })

    this.memebrNamePartailFetched$ = this.memberService.memberNamesFetched.subscribe((result) => {
      this.searchLoading = false;
      this.memebrNameResults = result.slice(0, 5);
    })
  }

  /** Are we using this anymore? */
  // getChildRoute(): void {
  //   console.log(this.route.children[0]);
  // }

  getDate() {
    let today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    return month + "/" + day + "/" + year;
  }

  onToggleSidenav() {
    this.sidenavToggle.emit();
  }

  onLogout() {
    // window.confirm('Do you want to logout') ? this.authService.logoutUser() : null;
  }

  onLogin() {
    this.authService.autoLoginViaWinAuth();
  }

  isAuth() {
    return this.authService.isAuthenticated();
  }

  getUser() {
    if (!this.isAuth())
      return '';
    let user: User = this.authService.getActionUser();
    return user.userFirstName + ' ' + user.userLastName;
  }

  onUniversalSearchDismiss() {
    this.inputActive = false;
  }

  onUniversalSearchExpand() {
    this.inputActive = true;
    this.usInputRef.nativeElement.focus();

    this.searchHistory = localStorage.getItem('globalsearch') ?
      JSON.parse(localStorage.getItem('globalsearch'))
      : [];

    console.log(this.searchHistory)
  }

  onSearch() {
    let ccaReg = new RegExp(/^5\d{9}$/);
    let mmisReg = new RegExp(/^1\d{11}$/); 1


    clearTimeout(this.searchTimer);
    if (!this.searchForm.valid) {
      return;
    }


    let value = this.searchForm.get('universalInput').value;
    if (!value) {
      return;
    }
    let isCCA = ccaReg.test(value);
    let isMMIS = mmisReg.test(value);

    if (isCCA) {
      this.searchForm.patchValue({ CCAID: value, Name: '', MMIS_ID: '' }, { emitEvent: false });
    } else if (isMMIS) {
      this.searchForm.patchValue({ CCAID: '', Name: '', MMIS_ID: value }, { emitEvent: false });
    } else {
      this.searchForm.patchValue({ CCAID: '', Name: value, MMIS_ID: '' }, { emitEvent: false });
    }

    this.searchTimer = setTimeout(() => {
      // this.pageState.pageIndex = 0;
      // console.log(this.searchForm.value)
      // this.onPagedAndSorted.emit({ ...this.searchForm.value, ...this.pageState });
      this.memberService.getMemberNamesByNamePartial(this.searchForm.get('Name').value);
      this.searchLoading = true;
    }, 200);
  }

  onResultItemClick(item: MemberName, field: string) {
    this.searchHistory = localStorage.getItem('globalsearch') ?
      JSON.parse(localStorage.getItem('globalsearch'))
      : [];

    if (this.searchHistory.length >= 5 || (this.searchHistory.length < 5 && this.searchHistory.includes(item))) {
      let index = -1

      this.searchHistory.forEach(h => {
        if (h.masterPatientID === item.masterPatientID) {
          index = this.searchHistory.indexOf(h);
        }
      });
      this.searchHistory.splice(index, 1);
    }
    this.searchHistory.unshift(item);

    localStorage.setItem('globalsearch', JSON.stringify(this.searchHistory));

    switch (field) {
      case 'members':
        this.router.navigate(['/members', { outlets: { 'patient': [item.masterPatientID] } }], {});
        this.navService.onNav(item);
        return;
      default:
        return;
    }
  }

  getNotification() {
    return this.notifications ? (this.notifications.length > 10 ? '10+' : this.notifications.length) : 0;
  }

  clearNotification() {
    setTimeout(() => {
      this.notifications = [];
    }, 300);
    // this.notificationService.resetNotification().subscribe(() => {
    //   this.notifications = [];
    // });
  }

  isNotificationHighlighted(notification: Notification): boolean {
    return this.notifications.includes(notification);;
  }

  clearAlertList() {
    this.notificationService.resetNotification();
    this.alertList = [];
  }

  getNotificationType(notification: Notification): string {
    return notification.NotificationType;
  }

  onNoticationItemClick(notification: Notification) {
    switch (notification.NotificationType) {
      case 'member':
        this.router.navigate(['/worklist', { outlets: { 'patient': [notification.NotificationObject[0]] } }], {});
        this.navService.onNav({});
        this.notificationService.onNotificationClick(notification);
        return;
      case 'comment':
        this.router.navigate(['/members', { outlets: { 'patient': [notification.NotificationObject['MasterPatientID']] } }], {
          queryParams: { 'discrepancyId': notification.NotificationObject['DiscrepancyID'], 'type': 'comment' },
        });
        this.navService.onNav({masterPatientID: notification.NotificationObject['MasterPatientID']});
        this.notificationService.onNotificationClick(notification);
        return;
      case 'discrepancy':
        // this.router.navigate(['/worklist', { outlets: { 'patient': [notification.NotificationObject['MasterPatientID']] } }], {});
        // this.navService.onNav(notification);
        return;
      default:
        return;
    }
  }
}