import { ActivatedRoute, ParamMap } from '@angular/router';
import { User } from './../../model/user.model';
import { RawDiscrepancyComment } from './../../model/discrepancyComment.model';
// import { CommentaryElement, C_DATA, MasterCommentaryElement, DisElement } from './../../MOCK_DATA';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, DoCheck, Renderer2, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { throwError, Subscription, of } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SharedService } from '../shared.service';
import { PagedList } from 'src/app/model/response.model';
import { DiscrepancyComment } from 'src/app/model/discrepancyComment.model';
import { AuthService } from 'src/app/auth/auth.service';
import { Discrepancy } from 'src/app/model/discrepancy.model';
import { NotificationService } from 'src/app/notification.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-commentary-container',
  templateUrl: './commentary-container.component.html',
  styleUrls: ['./commentary-container.component.css']
})
export class CommentaryContainerComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, DoCheck {
  // used to change commentary height;
  @ViewChild('commentaryEf') commentaryEf: ElementRef;
  @ViewChild('inputEf') inputEf: ElementRef;
  @Input('displayDiscrepancyInfo') displayDiscrepancyInfo: boolean;
  @Input('containerH') containerH: number;
  @Input('masterPatientID') masterPatientID: number;
  @Input('discrepancyID') discrepancyID: number;
  @Input('discrepancy') discrepancy: Discrepancy;
  @Output() commentaryDismissed = new EventEmitter<void>();

  // private _masterPatientID: number;
  // @Input('masterPatientID')
  // set masterPatientId(masterPatientId: number) {
  //   this._masterPatientID = masterPatientId;
  // };

  // get masterPatientID(): number {
  //   return this._masterPatientID;
  // }

  // private _discrepancyID: number;
  // @Input('discrepancyID')
  // set discrepancyID(discrepancyID: number) {
  //   console.log("INPUT _discrepancyID DETECTED", this._discrepancyID, discrepancyID)
  //   this._discrepancyID = discrepancyID;
  //   this.getDiscrepancyInfo();
  //   this.getDiscrepancyInfo();
  //   this.getAnchoredCommentId();
  // };

  // get discrepancyID(): number {
  //   return this._discrepancyID;
  // }

  // prefixed input height
  inputEfHeight: number = 110;

  sourceComments: DiscrepancyComment[];
  commentList: DiscrepancyComment[];

  // anchored CommentID
  anchoredCommentId: number;

  private disrepancyCommentListChanged$: Subscription;
  private discrepancyCommentCreated$: Subscription;
  private router$: Subscription;
  private actionUser: User;

  constructor(private renderer: Renderer2,
    private _snackBar: MatSnackBar,
    private serivce: SharedService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.initSource();
    this.initState();

    // console.log('ngOnInit', this.inputEfHeight, this.containerH, this.inputEf.nativeElement.offsetHeight);
  }

  ngDoCheck() {
    // 
    this.calculateCommentListHeight();
  }

  ngAfterViewInit() {
    this.onScrollBottom();
  }

  ngOnDestroy(): void {
    this.disrepancyCommentListChanged$.unsubscribe();
    this.discrepancyCommentCreated$.unsubscribe();
    this.router$.unsubscribe();
  }

  // Only when new master commment has been made, then scroll to the botttom
  ngAfterViewChecked() {
    // Temprary solution to check whether new master comment has been made
    // if(this.commentaryList.length == this.source.length)
    //   return;

    if (this.commentList.length == this.sourceComments.length)
      return;

    this.onScrollBottom();
    //MOCK
    // this.commentaryList = [...this.source];
    this.commentList = [...this.sourceComments];
  }

  initSource() {
    // Temp Set action user ID = 1;

    // this.actionUserID = 1;
    // this.discrepancyID = 1;

    if (!this.discrepancy) {
      // console.log("SOURCE INIT", this._discrepancyID, this.discrepancy)
      this.getDiscrepancyInfo();
    }

    this.actionUser = this.authService.getActionUser();

    this.sourceComments = this.serivce.getpagedListInl().list;
    this.commentList = [...this.sourceComments];
    this.serivce.getDiscrepancyCommnetByDiscrepancyID(this.discrepancyID);
    this.getAnchoredCommentId();
  }

  initState() {
    this.disrepancyCommentListChanged$ = this.serivce.disrepancyCommentListChanged.subscribe((result: PagedList<DiscrepancyComment>) => {
      this.nestComments(result.list);
      this.sortComments();
      // this.commentList = [...this.sourceComments];
    });

    this.discrepancyCommentCreated$ = this.serivce.discrepancyCommentCreated.subscribe((result: DiscrepancyComment) => {
      this.sourceComments.push(result);
      this.openSnackBar('Comment has been made', 'Dismiss')
    });

    this.router$ = this.route.queryParamMap.pipe(
      switchMap((param: ParamMap) => of(+param.get('discrepancyId'))
      )).subscribe(value => {
        console.log('ROUTE Detect')
        if (value && value > 0 && value != this.discrepancyID ) {
          this.discrepancyID = value;
          this.getDiscrepancyInfo();
          this.serivce.getDiscrepancyCommnetByDiscrepancyID(this.discrepancyID);
          this.getAnchoredCommentId();
        }
      });
  }

  nestComments(rawCommentList: RawDiscrepancyComment[]): void {
    let rawMasterComments = rawCommentList.filter((c: RawDiscrepancyComment) => !c.replyCommentID).slice();
    let masterComments: DiscrepancyComment[] = rawMasterComments.map((c: DiscrepancyComment) => {
      return { ...c, ...{ subComments: [] } }
    });

    rawCommentList.filter(c => c.replyCommentID).forEach(
      (s: RawDiscrepancyComment) => {
        masterComments.find((m: DiscrepancyComment) =>
          m.discrepancyCommentID === s.replyCommentID).subComments.push(s)
      }
    );
    this.sourceComments = masterComments;
    // this.calculateCommentListHeight();
  }

  sortComments() {
    this.sourceComments.sort((a, b) => Date.parse(a.insertDate) - Date.parse(b.insertDate));

    this.sourceComments.forEach(c => {
      c.subComments.sort((a, b) => Date.parse(a.insertDate) - Date.parse(b.insertDate));
    })
  }

  onCommentSubmited(val: { comment: string; anchoredUserIds: number[] }) {
    let newComment: DiscrepancyComment = {
      discrepancyCommentID: null,
      discrepancyID: this.discrepancyID,
      replyCommentID: null,
      comment_UserID: this.actionUser ? this.actionUser.userID : null,
      userFirstName: this.actionUser ? this.actionUser.userFirstName : '',
      userLastName: this.actionUser ? this.actionUser.userLastName : '',
      // discrepancyComment: val,
      discrepancyComment: val.comment,
      activeFlag: true,
      insertDate: new Date().toLocaleString(),
      updateDate: '',
      subComments: []
    }

    this.serivce.createDiscreapncyComment(newComment, val.anchoredUserIds, this.masterPatientID, 'create');
  }

  // Auto shwoing the latest the comment
  onScrollBottom() {
    try {
      this.commentaryEf.nativeElement.scrollTop = this.commentaryEf.nativeElement.scrollHeight;
    } catch (err) {
      throwError(err);
    }
  }

  onInputChange(e: string) {
    this.calculateCommentListHeight();
  }

  calculateCommentListHeight() {
    /** Prefixed Discrepancy Hight 102 */
    this.inputEfHeight = this.containerH - this.inputEf.nativeElement.offsetHeight - (this.displayDiscrepancyInfo ? 102 : 50);
  }

  onDismissClick() {
    this.commentaryDismissed.emit();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

  getDiscrepancyInfo() {
    this.serivce.getDiscrepancyById(this.discrepancyID)
    .subscribe(result => {
      if (result.isSuccess) {
        this.discrepancy = result.data;
      }
    }, error => {
      console.error(error);
    });
  }

  getAnchoredCommentId() {
    if (!this.notificationService.hasNotification())
      return;

    const notification = this.notificationService.getAndResetNotification();
    switch (notification.NotificationType) {
      case 'comment':
        this.anchoredCommentId = notification.NotificationObject['DiscrepancyCommentID']
        return;
      default:
        return;
    }
  }
}
