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

  ngOnInit() {
  }

  constructor(private authService: AuthService) {

  }

  ngOnDestroy(): void {

  }


  onClose() {
    if(!this.xsMatched) {
      //  this.closeSidenav.emit();
    } 
  }
  
  isAuth() {
    return this.authService.isAuthenticated();
  }
}
