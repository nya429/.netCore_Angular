import { UserOption } from 'src/app/model/user.model';
import { style } from '@angular/animations';
import { NavigationEnd } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { initChangeDetectorIfExisting } from '@angular/core/src/render3/instructions';
import { MatMenuTrigger } from '@angular/material';
import { SettingService } from 'src/app/setting/setting.service';

export interface CommentState {
  state: string;
  content: string;
};
@Component({
  selector: 'app-commentary-input',
  templateUrl: './commentary-input.component.html',
  styleUrls: ['./commentary-input.component.css']
})
export class CommentaryInputComponent implements OnInit {
  @ViewChild('textarea') private el: ElementRef;
  @ViewChild(MatMenuTrigger) private menuTrigger: MatMenuTrigger;
  @Output() onCommentChange = new EventEmitter<string>();
  @Output() onCommentSubmit = new EventEmitter<string>();
  @Output() onCommentHeightChanged = new EventEmitter<void>();
  @Output() onCommentCancel = new EventEmitter<void>();
  @Input() contentIn: string;
  @Input() commentState: CommentState;

  commentFormGroup: FormGroup;

  atSignPosition: any;
  anchoredUserIds: number[] = [];

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.initForm();
  }

  // focus  after view init
  ngAfterViewInit() {
    this.el.nativeElement.focus();

    if (this.commentState && this.commentState.state == 'edit') {
      this.el.nativeElement.style.height = (this.el.nativeElement.scrollHeight + 21) + "px";
    }
  }

  // textarea auto grow and shrink within Max-height
  autoGrowTextZone(e): void {
    // test text zone growth
    // console.log(e)
    this.el.nativeElement.style.height = "0px";
    this.el.nativeElement.style.height = (e.target.scrollHeight + 21) + "px";
    this.onCommentHeightChanged.emit();
  }

  initForm() {
    let content = this.commentState ? this.commentState.content : '';

    this.commentFormGroup = new FormGroup({
      comment: new FormControl(content, {
        validators: [Validators.maxLength(1005),
        Validators.minLength(4),
        Validators.required]
      }),
      anchoredUserIds: new FormControl(this.anchoredUserIds)
    });

    this.onFormChange();
  }

  resetForm() {
    this.anchoredUserIds = [];
    this.commentFormGroup.patchValue({
      comment: '',
      anchoredUserIds: this.anchoredUserIds
    }, { emitEvent: false });
    this.el.nativeElement.style.height = 72 + "px";
  }

  onKeyup($e) {
    // 'Enter' === 13
    if ($e.keyCode === 13
      && this.commentFormGroup.valid) {
      this.onEnterKey();
      return;
    }
    // '@' === 50
    if ($e.keyCode === 50) {
      this.onAtSignKey($e);
    }

    this.autoGrowTextZone($e);
  }

  onAnchorMenuKeyup(event: KeyboardEvent) {
    event.stopPropagation();
  }

  onEnterKey() {
    this.onSubmit();
    this.el.nativeElement.blur();
  }

  onFormChange() {
    this.commentFormGroup.get('comment')
      .valueChanges
      .subscribe(val => {
        this.onCommentChange.emit(val)
      }
      );
  }

  onSubmit() {
    this.onCommentSubmit.emit(
      // this.commentFormGroup.get('comment').value
      this.commentFormGroup.value
    )
    this.resetForm();
  }

  onCancel() {
    this.onCommentCancel.emit();
  }

  isUpdate(): boolean {
    return this.commentState && this.commentState.state === 'edit';
  }

  // Return user Options except anchored User
  getOptions(type: string = 'assigned_User'): UserOption[] {
    return this.settingService.getOptions(type).filter((user: UserOption) => !this.anchoredUserIds.includes(user.userID));
  }

  onAtSignKey(e: KeyboardEvent) {
    // this.el.nativeElement as 

    this.atSignPosition = (e.target as HTMLInputElement).selectionStart;
    if (this.el.nativeElement.setSelectionRange) {

      // get boundgin of container no useful
      let re = this.el.nativeElement.getBoundingClientRect()
      console.log(this.el.nativeElement.getBoundingClientRect(), (e.target as HTMLInputElement).selectionStart);

      this.el.nativeElement.setSelectionRange((e.target as HTMLInputElement).selectionStart - 1, (e.target as HTMLInputElement).selectionStart);

      this.onTextSelection(e, re);

      //   let sel = window.getSelection();
      //   console.log(sel, sel.getRangeAt(0))
      //   let range = sel.getRangeAt(0)
      //   range.text
      //   ;
      //  console.log(rec);
    }
    // console.log(e, this.el.nativeElement.setSelectionRange, this.el.nativeElement.setSelectionRange(0, (e.target as HTMLInputElement).selectionStart));
    // e.target.getBoundingClientRect();
  }

  onTextSelection(event: any, re): void {
    if (true) {
      var menu = document.getElementById('menuBtn');
      menu.style.display = '';
      // menu.style.position = 'absolute';
      // menu.style.left = event.pageX + 5 + 'px';
      // menu.style.top = event.pageY + 5 + 'px';

      menu.style.left = 5 + 'px';
      menu.style.top = 5 + 'px';
      this.menuTrigger.openMenu();
    }
  }

  onMenuClosed(): void {
    var menu = document.getElementById('menuBtn');
    if (menu) {
      menu.style.display = 'none';
    }

    this.el.nativeElement.focus();
  }

  onUserClick(user: UserOption): void {
    var front = (this.el.nativeElement.value).substring(0, this.atSignPosition);
    var back = (this.el.nativeElement.value).substring(this.atSignPosition, this.el.nativeElement.value.length);
    let value = front + user.userNameAD + " " + back;
    this.commentFormGroup.patchValue({
      comment: value,
    }, { emitEvent: false });

    this.anchoredUserIds.push(user.userID);
    console.log(this.anchoredUserIds);
  }
}
