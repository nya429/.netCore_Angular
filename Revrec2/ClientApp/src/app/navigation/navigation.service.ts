import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private _queryData: object;

  constructor() { 
    this._queryData = null;
  }

  onNav(data: object) {
    this._queryData = data;
  }

  onNaved(): object {
    const data: object = this._queryData;
    this._queryData = null;
    return data;
  }

  hasNavData(nextRoute? : string) {
    if (nextRoute) 
      return !!this._queryData && this._queryData['nextRoute'] === nextRoute
    return !!this._queryData;
  }
}
