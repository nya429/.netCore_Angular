import { AppService } from './../../app.service';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, ParamMap } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

@Component({
  selector: 'app-setting-container',
  templateUrl: './setting-container.component.html',
  styleUrls: ['./setting-container.component.css']
})
export class SettingContainerComponent implements OnInit {
  links = [];
  /** @input */
  activeLink;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private appSerivce: AppService
  ) {
    this.links = this.appSerivce.getSettingLinks();
    //  sub "/settings/active_link" => active_link
    this.activeLink = this.router.url.substring(10);
  }

  ngOnInit() { }

  onNavigate(link) {
    this.activeLink = link;
  }
}
