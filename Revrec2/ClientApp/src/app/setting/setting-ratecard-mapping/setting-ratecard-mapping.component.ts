import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SettingService } from '../setting.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { PagedList } from 'src/app/model/response.model';
import { RateCellMap, RegionMap } from 'src/app/model/setting.model';

@Component({
  selector: 'app-setting-ratecard-mapping',
  templateUrl: './setting-ratecard-mapping.component.html',
  styleUrls: ['./setting-ratecard-mapping.component.css']
})
export class SettingRatecardMappingComponent implements OnInit, OnDestroy {
  panelOpenState: boolean = true;

  // DiscrepancyStatus Data Source
  pagedSourceRateCell: PagedList<RateCellMap>;
  pagedSourceRegion: PagedList<RegionMap>;

  searchFormRateCell: FormGroup;
  searchFormRegion: FormGroup;
  searchTimer;

  updateState = [];

  unmappedRateCellCount: number = 0;
  unmappedRegionCount: number = 0;


  private regionMapListChanged$: Subscription;
  private rateCellMapListChanged$: Subscription;
  private regionMapListUpdated$: Subscription;
  private searchFormRegion$: Subscription;
  private rateCellMapListUpdated$: Subscription;
  private regionUnmappedCountGot$: Subscription;
  private rateCellUnmappedCountGotd$: Subscription;
  private searchFormRateCell$: Subscription;

  /** Authorization */
  listPermissionsRatecell: string;
  listPermissionsRegion: string;
  updatePermissionsRatecell: string;
  updatePermissionsRegion: string;

  constructor(
    private service: SettingService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
  ) {
    this.updatePermissionsRatecell = this.authService.getRoleMappingSettingByNames('ratecellmap', 'UpdateRateCellMapByIDAsync');
    this.updatePermissionsRegion = this.authService.getRoleMappingSettingByNames('regionmap', 'UpdateRegionMapByIDAsync');
    this.listPermissionsRatecell = this.authService.getRoleMappingSettingByNames('ratecellmap', 'GetRateCellMapListByConAsync');
    this.listPermissionsRegion = this.authService.getRoleMappingSettingByNames('regionmap', 'GetRegionMapListByConAsync')
  }

  ngOnInit() {
    this.initForm();
    this.initState();
    this.initSource();
  }

  ngOnDestroy(): void {
    this.regionMapListChanged$.unsubscribe();
    this.rateCellMapListChanged$.unsubscribe();
    this.regionMapListUpdated$.unsubscribe();
    this.rateCellMapListUpdated$.unsubscribe();
    this.regionUnmappedCountGot$.unsubscribe();
    this.rateCellUnmappedCountGotd$.unsubscribe();
    this.searchFormRateCell$.unsubscribe();
    this.searchFormRegion$.unsubscribe();
  }

  initForm() {
    this.searchFormRateCell = new FormGroup({
      mmis8200RateCell: new FormControl(''),
      ccaRateCell: new FormControl(''),
      mmis8200Product: new FormControl(''),
    });

    this.searchFormRegion = new FormGroup({
      mmis8200Region: new FormControl(''),
      ccaRegion: new FormControl(''),
      mmis8200Product: new FormControl(''),
    });
  }

  initState() {
    this.rateCellMapListChanged$ = this.service.rateCellMapListChanged.subscribe(result => {
      this.pagedSourceRateCell = result;
    });

    this.rateCellMapListUpdated$ = this.service.rateCellMapUpdated.subscribe((rateCellMapUpdated: RateCellMap) => {
      let rawPagedSource = { ...this.pagedSourceRateCell };
      rawPagedSource.list = rawPagedSource.list.map((rateCellMap: RateCellMap) => {
        if (rateCellMap.rateCellMapID === rateCellMapUpdated.rateCellMapID) {
          rateCellMap = { ...rateCellMapUpdated };
        }
        return rateCellMap;
      });
      this.pagedSourceRateCell = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
      this.service.getRateCellUnmappedCount();
    });

    this.regionMapListChanged$ = this.service.regionMapListChanged.subscribe(result => {
      this.pagedSourceRegion = result;
    });

    this.regionMapListUpdated$ = this.service.regionMapUpdated.subscribe((regionMapUpdated: RegionMap) => {
      let rawPagedSource = { ...this.pagedSourceRegion };
      rawPagedSource.list = rawPagedSource.list.map((regionMap: RegionMap) => {
        if (regionMap.regionMapID === regionMapUpdated.regionMapID) {
          regionMap = { ...regionMapUpdated };
        }
        return regionMap;
      });
      this.pagedSourceRegion = rawPagedSource;
      this.openSnackBar("Update Successed", "Dismiss")
      this.service.getRegionUnmappedCount();
    });

    this.regionUnmappedCountGot$ = this.service.regionMapUnmappdCountGot.subscribe((count: number) => {
      this.unmappedRegionCount = count;
    });
    this.rateCellUnmappedCountGotd$ = this.service.rateCellMapUnmappdCountGot.subscribe((count: number) => {
      this.unmappedRateCellCount = count;
    });
    this.searchFormRateCell$ = this.searchFormRateCell.valueChanges.subscribe(() => {
      this.getPagedDataSource('ratecell');
    })

    this.searchFormRegion$ = this.searchFormRegion.valueChanges.subscribe(() => {
      this.getPagedDataSource('region');
    });

  }

  initSource() {
    this.pagedSourceRateCell = this.service.getpagedListInl();
    this.pagedSourceRegion = this.service.getpagedListInl();
    this.service.getRateCellUnmappedCount();
    this.service.getRegionUnmappedCount();
    this.service.getRateCellMaps({}, this.searchFormRateCell.value);
    this.service.getRegionMaps({}, this.searchFormRegion.value);
  }

  // getOptions(from: string, product: string): string[] {
  //   return this.service.getOptionsMOCK(from, product);
  // }

  getPagedDataSource(type: string) {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      switch (type) {
        case 'ratecell':
          this.service.getRateCellMaps({}, this.searchFormRateCell.value);
          break;
        case 'region':
          this.service.getRegionMaps({}, this.searchFormRegion.value);
          break;
        default:
          break;
      }
    }, 800);
  }

  onListPagedSorted(e, type: string) {
    switch (type) {
      case 'ratecell':
        this.service.getRateCellMaps(e, this.searchFormRateCell.value);
        break;
      case 'region':
        this.service.getRegionMaps(e, this.searchFormRegion.value);
        break;
      default:
        break;
    }
  }

  onUpdate(e, type: string) {
    switch (type) {
      case 'ratecell':
        this.service.updateRateCellMap(e[0]);
        break;
      case 'region':
        this.service.updateRegionMap(e[0]);
        break;
      default:
        break;
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  isAuthorized(view: string) {
    switch (view) {
      case "updateRegion":
        return this.authService.isViewAuthorized(this.updatePermissionsRegion);
      case "updateRateCell":
        return this.authService.isViewAuthorized(this.updatePermissionsRatecell);
      case "listRegion":
        return this.authService.isViewAuthorized(this.listPermissionsRegion);
      case "listRateCell":
        return this.authService.isViewAuthorized(this.listPermissionsRatecell);
      default:
        return false;
    }
  }
}
