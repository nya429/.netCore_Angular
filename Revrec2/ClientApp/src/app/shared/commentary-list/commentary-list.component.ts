import { Component, OnInit, Input } from '@angular/core';
// import { C_DATA, CommentaryElement, MasterCommentaryElement } from 'src/app/MOCK_DATA';

@Component({
  selector: 'app-commentary-list',
  templateUrl: './commentary-list.component.html',
  styleUrls: ['./commentary-list.component.css']
})
export class CommentaryListComponent implements OnInit {
  @Input() source: any[];
  commentaryList : any[];

  constructor() { }

  ngOnInit() {
    this.commentaryList = this.source;
  }



}
