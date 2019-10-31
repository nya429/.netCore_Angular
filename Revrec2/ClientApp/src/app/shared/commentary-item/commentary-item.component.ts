import { SharedService } from 'src/app/shared/shared.service';
import { DiscrepancyComment } from 'src/app/model/discrepancyComment.model';
import { CommentaryElement } from 'src/app/MOCK_DATA';
import { Component, OnInit, Input } from '@angular/core';
import { CommentState } from '../commentary-input/commentary-input.component';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user.model';

@Component({
  selector: 'app-commentary-item',
  templateUrl: './commentary-item.component.html',
  styleUrls: ['./commentary-item.component.css']
})
export class CommentaryItemComponent implements OnInit {
  @Input('source') source: DiscrepancyComment;
  @Input('actionUser') actionUser: User;

  comment: DiscrepancyComment;
  
  private discrepancyCommentUpdated$: Subscription;
  inputContent: string = "";
  commentState: CommentState;

  /** 
   * LocalAction: Edit Toggel
   *              Store Input
   * 
   *  State        update 
   *               edit
   *                           
  */ 
  constructor(
    private _snackBar: MatSnackBar,
    private service: SharedService)  { }

  ngOnInit(): void {
    this.initState();
    this.comment = this.source;
    this.commentState = {
      content: this.comment.discrepancyComment,
      state: 'display'
    };
  }

  ngOnDestroy(): void {
    this.discrepancyCommentUpdated$.unsubscribe();
  }

  initState(): void {
    this.discrepancyCommentUpdated$ = this.service.discrepancyCommentUpdated.subscribe((result: DiscrepancyComment) => {
      if (this.comment.discrepancyCommentID != result.discrepancyCommentID)  
        return;
      this.comment = result;
      this.openSnackBar('Comment has been made', 'Dismiss');
    })
  }

  // Temprary setting
  editable(): boolean {
    // console.log('actionuser', this.actionUser, this.comment.comment_UserID)
    let actionUserId = this.actionUser ? this.actionUser.userID : 0;
    return this.comment.comment_UserID === actionUserId;
  }
  
  onCommentEdit(): void {
    if (!this.editable()) 
      return;

    this.commentState.state = 'edit';
    this.inputContent = this.commentState.content;
  }

  onCommentChanged(val) {
    // Temprary storage, will use service later
    
    this.inputContent = val ? val : "";
  }

  onCommentUpdate(val: string): void {
    let updateSubComment = {...this.comment}; 
    updateSubComment.discrepancyComment = val;
    updateSubComment.updateDate = new Date().toLocaleString();
    this.service.updateDiscreapncyComment(updateSubComment);
    this.commentState.content = val;
    this.commentState.state = 'display';
    this.inputContent = "";
    this.openSnackBar('Comment Update Successfully', 'Dismiss')
  }

  onCommentCancel(): void {
    this.inputContent = "";
    this.commentState.content = this.comment.discrepancyComment,
    this.commentState.state = 'display';
  }

  onInputDismiss(): void {
    this.commentState.state = 'display';
    this.commentState.content = this.inputContent;
  }

  getUpdatedOrCreatedTime(): string {
    // console.log(this.comment.updateDate)
    return this.comment.updateDate.length > 0  ? 
      this.comment.updateDate : 
      this.comment.insertDate;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1500,
    });
  }

}
