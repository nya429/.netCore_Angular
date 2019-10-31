import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Member } from '../model/member.model';
// import { Provider } from './fetch-data/fetch-data.component';


@Directive({ selector: '[appHighLight]' })
export class HighLighttDirective {
  private context: HighLightContext | null = null;
  private _creteria: SearchCriteria;
  private _member: Member;

  constructor(
    private templateRef: TemplateRef<HighLightContext>,
    private viewContainer: ViewContainerRef) { }

  /**
  @Input() set appHighLight(searchCreteria: SearchCriteria) {
    console.log(this.templateRef)
    console.log(this.viewContainer)
  }
  **/

  @Input() set appHighLight(value: string) {
    let segments = value.trim().split(" ");
    this._creteria = {
      segment1st: segments[0],
      segment2nd: segments.length > 1 ? segments[1] : segments[0]
    }
  };
  @Input() set appHighLightText(value: Member) { this._member = value; };

  ngOnInit(): void {
    this.context = {
      highlightedText: this.getText()
    };
    this.viewContainer.createEmbeddedView(this.templateRef, this.context);
  }

  titleCase(name: string) {
    let str = name.toLowerCase().split(' ');

    let final = [];

    for (let word of str) {
      final.push(word.charAt(0).toUpperCase() + word.slice(1));
    }

    return final.join(' ')
  }
  
  getText() {
    let memebrFullName = this.titleCase(this._member.memberFirstName + ' ' + this._member.memberLastName);
    if (isEmpty(this._creteria)) {
      return {
        before: memebrFullName,
        match1: '',
        seg1: '',
        match2: '',
        after: ''
      };
    }

    // firstname
    let matchStartF = 0;
    let matchEndF = 0;
    if (this._creteria.segment1st && this._creteria.segment1st.length > 0) {
      matchStartF = this._member.memberFirstName.toLowerCase().indexOf(this._creteria.segment1st.toLowerCase());

      matchEndF = matchStartF === -1 ? matchEndF : matchStartF + this._creteria.segment1st.length;
      matchStartF = matchStartF === -1 ? matchEndF : matchStartF;
    }

    // lastname
    let matchStartL = memebrFullName.length;
    let matchEndL = memebrFullName.length;
    if (this._creteria.segment2nd && this._creteria.segment2nd.length > 0) {
      let firstNameLength = this._member.memberFirstName ? this._member.memberFirstName.length + 1 : 1;
      matchStartL = this._member.memberLastName.toLowerCase().indexOf(this._creteria.segment2nd.toLowerCase());


      matchEndL = matchStartL === -1 ? matchEndL : matchStartL + this._creteria.segment2nd.length + firstNameLength;
      matchStartL = matchStartL === -1 ? matchEndL : matchStartL + firstNameLength;
    }

    // full name or last name
    // let matchStart = 0;
    // let matchEnd = 0;
    // if (this._creteria.provName && this._creteria.provName.length > 0) {
    //   matchStart = this._provider.providerName.toLowerCase().indexOf(this._creteria.provName.toLowerCase());
    //   matchEnd = matchStart + this._creteria.provName.length;
    // }

    let match1s, match1e, match2s, match2e;

    let numArray = [[matchStartF, matchEndF], [matchStartL, matchEndL]];

    // numArray.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
    match1s = numArray[0][0];
    match1e = numArray[0][1];
    match2s = numArray[1][0];
    match2e = numArray[1][1];
    // match3s = numArray[2][0];
    // match3e = numArray[2][1];


    //console.log(match1s, match1e, match2s, match2e, match3s, match3e);
    // if (match1e > match2s) {
    //   [match1e, match2s, match2e] = this.exchange([match1e, match2s, match2e]);
    // } 

    // if (match2e > match3s) {
    //   [match2e, match3s, match3e] = this.exchange([match2e, match3s, match3e]);
    // } 


    return {
      before: memebrFullName.slice(0, match1s),
      match1: memebrFullName.slice(match1s, match1e),
      seg1: memebrFullName.slice(match1e, match2s),
      match2: memebrFullName.slice(match2s, match2e),
      after: memebrFullName.slice(match2e, memebrFullName.length),
    };


    /**
    return {
      before: this._providerName.slice(0, matchStart),
      match: this._providerName.slice(matchStart, matchStart + this._creteria.provFirstName.length),
      after: this._providerName.slice(matchStart + this._creteria.provFirstName.length)
    };
    **/
  }

  exchange([end1, start2, end2]) {
    return [start2, start2, end1 > end2 ? end1 : end2];
  }
}

interface SearchCriteria {
  segment1st: string;
  segment2nd: string;
}

interface HighLightContext {
  //$implicit: string;
  highlightedText: {
    before: string;
    seg1: string;
    match2: string;
    after: string;
  }
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj[key] && obj[key].trim() !== "")
      return false;
  }
  return true;
}



