// tslint:disable-next-line:no-duplicate-imports
import { NgModule, Injectable, Optional, Inject } from '@angular/core';
import {
  MatButtonModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatTabsModule,
  MatCardModule,
  MatExpansionModule,
  MatGridListModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatOptionModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatDialogModule,
  MatChipsModule,
  MatTooltipModule,
  MatSnackBarModule,
  NativeDateAdapter,
  DateAdapter,
  MatStepperModule,
  MatBadgeModule,
  MatButtonToggleModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatRippleModule,
  MatProgressBarModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMomentDateModule, MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from "@angular/material-moment-adapter";
// the `default as` syntax.
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

export const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

// extend NativeDateAdapter's format method to specify the date format.
export class CustomDateAdapter extends NativeDateAdapter {

  format(date: Date, displayFormat: Object): string {
    console.log('DATE_ADAPTER_FORMAT',displayFormat, date, typeof date)
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const diff = date.getTimezoneOffset();

     if (displayFormat === 'YYYY-MM-DD') {
       console.log(date.toISOString(), year, diff)
        return `${year}-${month > 9 ? month : "0" + month}-${day > 9 ? day : "0" + day}`;
     } else {
        return `${monthNames[month - 1]} ${year}`;
     }
  }
  
  // If required extend other NativeDateAdapter methods.
}

// Extend MomentDateAdapter
// export class CustomDateAdapter1 extends MomentDateAdapter {
//   format(date: Moment, displayFormat: Object): string {
//     console.log('DATE_ADAPTER_FORMAT',displayFormat, date, typeof date)
//     const day = date .dategetDate();
//     const month = date.getMonth() + 1;
//     const year = date.getFullYear();
//     const diff = date.getTimezoneOffset();

//      if (displayFormat === 'YYYY-MM-DD') {
//        console.log(date.toISOString(), year, diff)
//         return `${year}-${month > 9 ? month : "0" + month}-${day > 9 ? day : "0" + day}`;
//      } else {
//         return `${monthNames[month - 1]} ${year}`;
//      }
//   }
  
//   // If required extend other NativeDateAdapter methods.
// }



// export const MY_FORMATS = {
//   parse: {
//     dateInput: {month: 'numeric', year: 'numeric'}
//   },
//   display: {
//     dateInput: 'YYYY-MM-DD',
//     monthYearLabel: {year: 'numeric', month: 'short'},
//     dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
//     monthYearA11yLabel: {year: 'numeric', month: 'long'},
//   },
// };



@Injectable()
export class UTCDateAdapter extends MomentDateAdapter {

    constructor( @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale);
    }

    parse(value: any, parseFormat: string | string[]): Moment | null {
      if (value && typeof value === 'string') {
            return moment.utc(value, parseFormat, this.locale, true);
        }
        return value ? moment.utc(value).locale(this.locale) : value;
    }

    // createDate(year: number, month: number, date: number): Moment {
    //   console.log('CREATEDAte')
    //     // Moment.js will create an invalid date if any of the components are out of bounds, but we
    //     // explicitly check each case so we can throw more descriptive errors.
    //     if (month < 0 || month > 11) {
    //         throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    //     }

    //     if (date < 1) {
    //         throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    //     }

    //     let result = moment.utc({ year, month, date }).locale(this.locale);

    //     // If the result isn't valid, the date must have been out of bounds for this month.
    //     if (!result.isValid()) {
    //         throw Error(`Invalid date "${date}" for month with index "${month}".`);
    //     }

    //     return result;
    // }

    today(): Moment {
        return moment.utc().locale(this.locale);
    }

    // format(date: Moment, displayFormat: string): string {
    //   console.log('FORMAT', date, displayFormat)
    //   return date.format(displayFormat);
    // }
}




export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@NgModule({
  imports: [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatGridListModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatStepperModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatMomentDateModule,
    MatRippleModule,
    MatProgressBarModule
  ],
  exports: [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatGridListModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatStepperModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatMomentDateModule,
    MatRippleModule,
    MatProgressBarModule
  ],
  providers: [
    {provide: DateAdapter, useClass: UTCDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class MaterialModule {}