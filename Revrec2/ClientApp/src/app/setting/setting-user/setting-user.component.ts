import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SettingService } from '../setting.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SettingUserFormDialogComponent } from './setting-user-form-dialog/setting-user-form-dialog.component';
import { Subscription } from 'rxjs';
import { PagedList } from 'src/app/model/response.model';
import { User } from 'src/app/model/user.model';
import { SelectionModel } from '@angular/cdk/collections';
import { deepIsEqual } from './../../util/deepIsEqual';

@Component({
  selector: 'app-setting-user',
  templateUrl: './setting-user.component.html',
  styleUrls: ['./setting-user.component.css'],
  animations: [
    trigger('button-edit-slide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate("200ms ease-out", style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate(100, style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ],
})
export class SettingUserComponent implements OnInit {

  // MOCK
  dataSource: UserMock[] = [];
  USERS: string[] = ['Yue Song', 'Jonathan Lewis', 'Nicholas Frenette', 'Remo Andrade', 'Alain Alsina'
    , 'Veronica Marin', 'Leslie Alvarez', 'Albany Ortiz'];

  /** search filter */
  searchForm: FormGroup;
  searchTimer;

  private usersChanged$: Subscription;
  private userCreated$: Subscription;
  private userUpdated$: Subscription;
  private searchForm$: Subscription;
  private dialogClose$: Subscription;


  // DiscrepancyStatus Data Source
  pagedSource: PagedList<User>;

  selection = new SelectionModel<User>(true, []);

  /** Authorization */
  createPermissions: string;
  updatePermissions: string;


  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private service: SettingService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.createPermissions = this.authService.getRoleMappingSettingByNames('member', 'UpdateDiscrepancyForMultipleMembersByConAsync');
    this.updatePermissions = this.authService.getRoleMappingSettingByNames('member', 'UpdateMultipleDiscrepanciesBYFiltersByConAsync');
   }

  ngOnInit() {
    this.initForm();
    this.initState();
    this.initSource();

    // MOCK
    this.userInitMock();
  }

  ngOnDestroy() {
    this.usersChanged$.unsubscribe();
    this.userCreated$.unsubscribe();
    this.userUpdated$.unsubscribe();
    this.searchForm$.unsubscribe();
    if (this.dialogClose$) {
      this.dialogClose$.unsubscribe();
    }
  }

  initState() {

    this.usersChanged$ = this.service.userListChanged.subscribe(result => {
      this.pagedSource = result;
    });

    this.searchForm$ = this.searchForm.valueChanges.subscribe(() => {
      this.getUsers();
    });

    this.userCreated$ = this.service.userCreated.subscribe((user: User) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.count += 1
      rawPagedSource.list.unshift(user);
      rawPagedSource.list.pop();
      this.pagedSource = rawPagedSource;
      this.pagedSource.count += 1;
      this.openSnackBar(`User ${user.userFirstName} ${user.userLastName} Added`, "Dismiss")
    });

    this.userUpdated$ = this.service.userUpdated.subscribe((userUpdated: User) => {
      let rawPagedSource = { ...this.pagedSource };
      rawPagedSource.list = rawPagedSource.list.map((user: User) => {
        if (user.userID === userUpdated.userID) {
          if (!deepIsEqual(user, userUpdated)) {
            user = { ...userUpdated };
          }
        }
        return user;
      });
      this.pagedSource = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
    });
  }

  initSource() {
    this.pagedSource = this.service.getpagedListInl();
    this.service.getUsers({}, this.searchForm.value);
  }

  userInitMock() {
    this.USERS.map(u => {
      let roleBi = (Math.floor(Math.random() * 15)).toString(2);
      let user: UserMock = {
        name: u,
        email: u.split(' ')[0][0].toLocaleLowerCase() + u.split(' ')[1].toLocaleLowerCase() + '@commonwealthcare.org',
        active: 1,
        role: '0'.repeat(4 - roleBi.length) + roleBi

      }
      this.dataSource.push(user);
    })

  }

  initForm() {
    this.searchForm = this.fb.group({
      userID: new FormControl(''),
      userNameAD: new FormControl(''),
    });
  }

  openDialog(action: string): void {

    const dialogRef = this.dialog.open(SettingUserFormDialogComponent, {
      height: '500px',
      width: '400px',
      data: { selection: null, type: action }
    });

    this.dialogClose$ = dialogRef.afterClosed().subscribe((user: User | string) => {
      if (!user || user === '')
        return;

        this.service.createUser(user as User);
    });
  }

  getUsers() {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.service.getUsers({}, this.searchForm.value);
    }, 800);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  onDiscrepnacyStatusSelected(e: SelectionModel<User>) {
    this.selection = e;
  }

  onListPagedSorted(e) {
    this.service.getUsers(e, this.searchForm.value);
  }

  onUpdate(e) {
    this.service.updateUser(e[0]);
  }

  isAuthorized(view: string) {
    switch (view) {
      case "create":
        return this.authService.isViewAuthorized(this.createPermissions);
      case "update":
        return this.authService.isViewAuthorized(this.updatePermissions);
      default:
        return false;
    }
  }
}

export interface UserMock {
  name: string;
  email: string;
  active: number;
  role: string; // Binary code
};

