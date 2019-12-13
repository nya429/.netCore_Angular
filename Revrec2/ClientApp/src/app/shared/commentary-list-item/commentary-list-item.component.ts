// import { MasterCommentaryElement } from './../../MOCK_DATA';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
// import { CommentaryElement } from 'src/app/MOCK_DATA';
import { MatCheckbox, MatSnackBar } from '@angular/material';
import { CommentState } from './../commentary-input/commentary-input.component';
import { DiscrepancyComment } from 'src/app/model/discrepancyComment.model';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user.model';

@Component({
  selector: 'app-commentary-list-item',
  templateUrl: './commentary-list-item.component.html',
  styleUrls: ['./commentary-list-item.component.css']
})
export class CommentaryListItemComponent implements OnInit, OnDestroy {
  @Input('source') masterComment: DiscrepancyComment;
  @Input('actionUser') actionUser: User;
  @Input('masterPatientID') masterPatientID: number;
  
  private discrepancyCommentReplied$: Subscription;
  // Cached created Sub Comment 
  inputContent: string; 

  // commentState: CommentState;  // needed?
  // editedId: string;
  
  inputRendered: boolean = false;

  constructor(    
    private _snackBar: MatSnackBar,
    private serivce: SharedService) { }

  ngOnInit() {
    this.initState();
  }

  ngOnDestroy(): void {
    this.discrepancyCommentReplied$.unsubscribe();
  }

  initState() {
    this.discrepancyCommentReplied$ = this.serivce.discrepancyCommentReplied.subscribe((result: DiscrepancyComment) => {
      if (this.masterComment.discrepancyCommentID != result.replyCommentID)  
        return;
      this.masterComment.subComments.push(result);
      this.openSnackBar('Comment has been made', 'Dismiss');
    })
  }
  
  isInputRender(): boolean {
    return this.inputRendered;
  }

  // should fire after ViewInit
  onInputDismiss(): void {
    if (this.inputContent && this.inputContent.length > 0) 
      return;

    this.inputRendered = false;
  }

  onRenderInput() {
    this.inputRendered = true;
  }

  // store unsubmitted new sub content
  onCommentChanged(val) {
    this.inputContent = val;
  }

  // onCommentSubmited(val: string) {
  onCommentSubmited(val: {comment: string; anchoredUserIds: number[]}) {
    let newSubComment: DiscrepancyComment = {
      discrepancyCommentID: null,
      discrepancyID: this.masterComment.discrepancyID,
      replyCommentID: this.masterComment.discrepancyCommentID,
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
    // this.serivce.createDiscreapncyComment(newSubComment, 'reply');
    this.serivce.createDiscreapncyComment(newSubComment, val.anchoredUserIds, this.masterPatientID,'reply');
    this.inputContent = '';
    this.onInputDismiss();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }
}
