import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

const ELEMENT_DATA = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-discrepancy-detail-container',
  templateUrl: './discrepancy-detail-container.component.html',
  styleUrls: ['./discrepancy-detail-container.component.css'],
  animations: [
    trigger('container', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8%) scale(0.95)',}),
        animate("300ms ease-out", style({ opacity: 1, transform: 'translateY(0)  scale(1)', })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)', }),
        animate(200, style({ opacity: 0, transform: 'translateY(5%)', })),
      ]),
    ]),

    trigger('sub-container', [
      transition(':enter', [
        style({ opacity: 1, transform: 'translateX(100%)',}),
        animate("300ms ease-out", style({ opacity: 1, transform: 'translateX(0)', })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)', }),
        animate(200, style({ opacity: 1, transform: 'translateX(100%)', })),
      ]),
    ]),
  ],
})
export class DiscrepancyDetailContainerComponent implements OnInit {
  @ViewChild('host') hostView: ElementRef;
  @Output() onDismissed = new EventEmitter<void>();
  
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  contentHeight: number;
  contentWidth: number;

  isSideComponentContainerDisplay = false;
  sideComponentContents = ['comment', 'history'];

  constructor() { }

  ngOnInit() {
  }

  ngDoCheck() {
    // get sub-list height at every tick  
    this.contentHeight = this.hostView.nativeElement.offsetHeight;
    this.contentWidth = this.hostView.nativeElement.offsetHeight;
  }

  onDismiss() {
    this.onDismissed.emit();
  }

  toggleChange(event) {
    let toggle = event.source;
    if (toggle) {
        let group = toggle.buttonToggleGroup;
        if (event.value.some(item => item == toggle.value)) {
            group.value = [toggle.value];
            this.isSideComponentContainerDisplay = true;
        }
    } else {
      this.isSideComponentContainerDisplay = false;
    }
  }
}
