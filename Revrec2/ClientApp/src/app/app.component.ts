import { Subscription } from 'rxjs';
import { AppService } from './app.service';
import { Component, ChangeDetectorRef, OnDestroy, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { fadeAnimation } from './setting/setting.animation';
import { RouterOutlet, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
  // animations: [fadeAnimation]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild("outlet") outlet: RouterOutlet;

  title = 'Revrec';
  mode = 'side';
  xsQuery: MediaQueryList;

  authed: string = 'undetermined';
  optionReadyed: boolean = false;

  auth$: Subscription;
  optionReady$: Subscription;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private service: AppService) {
    this.xsQuery = media.matchMedia('(max-width: 1480px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.xsQuery.addListener(this._mobileQueryListener);
  }

  private _mobileQueryListener: () => void;

  ngOnInit() {
    this.service.init();

    this.auth$ = this.service.signInStateChanged.subscribe((authResult: string) => {
      this.authed = authResult;
      console.log(this.authed)
      // temp set
      if (this.authed === 'failed') {
        this.optionReadyed = true;
      }
    });

    this.optionReady$ = this.service.optionInited.subscribe(() => {
      this.optionReadyed = true;

    });
  }

  ngOnDestroy() {
    this.auth$.unsubscribe();
    this.optionReady$.unsubscribe();
  }


  /**  @fixme Router Animation 
  getState() {
    if (!this.outlet) {
      return null;
    }
    console.log(this.outlet.activatedRoute.component);
    return this.outlet.isActivated ? this.outlet.activatedRouteData.state : '';
  }
  */ 

  isAuthed() {
    return this.authed === 'authed';
  }

}
