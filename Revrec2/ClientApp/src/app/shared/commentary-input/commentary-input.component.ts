import { Component, OnInit, ElementRef, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { initChangeDetectorIfExisting } from '@angular/core/src/render3/instructions';

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
  @Output() onCommentChange = new EventEmitter<string>();
  @Output() onCommentSubmit = new EventEmitter<string>();
  @Output() onCommentHeightChanged = new EventEmitter<void>();
  @Output() onCommentCancel= new EventEmitter<void>();
  @Input() contentIn: string;
  @Input() commentState: CommentState;
  
  commentFormGroup: FormGroup;
  
  constructor() { }

  ngOnInit() {
    this.initForm();
  }
  
  // focus  after view init
  ngAfterViewInit() {
    this.el.nativeElement.focus();

    if(this.commentState && this.commentState.state == 'edit') {
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
        validators: [Validators.maxLength(255),
                     Validators.minLength(4),
                     Validators.required]
      })
    });

    this.onFormChange();
  }

  resetForm() {
    this.commentFormGroup.reset();
    this.el.nativeElement.style.height = 72 + "px";
    
  }
 
  onKeyup($e) {
    // 'Enter' === 13
    if ($e.keyCode === 13 
      && this.commentFormGroup.valid) {
      this.onSubmit();
      this.el.nativeElement.blur();
      return;
    }

    this.autoGrowTextZone($e);
  } 

  onFormChange() {
    this.commentFormGroup.get('comment')
    .valueChanges
    .subscribe(val => {
      this.onCommentChange.emit(val)}
    );
  }

  onSubmit() {
    this.onCommentSubmit.emit(
      this.commentFormGroup.get('comment').value
      )
    this.resetForm();
  }

  onCancel() {
    this.onCommentCancel.emit();
  }

  isUpdate(): boolean {
    return this.commentState && this.commentState.state === 'edit';
  }

}
