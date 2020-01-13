import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errors = new Subject<string[]>();

  constructor(private _snackBar: MatSnackBar,
    private zone: NgZone) { }

  sendCustomizedError(error: string[]) {
    // this.errors.next(error);
    this.initErrorHandler(error);
  }

  // Server Side Errors
  addServerErrors(error): void {
    let errorMessage = [`${error.error.Message} \r\n`, `Error: ${error.message} \r\n`, `Detail: ${error.error.ErrorMessage} \r\n`];
    // this.errors.next(errorMessage);
    this.initErrorHandler(errorMessage);
  }

  getServerErrors() {
    return this.errors.asObservable();
  }

  // Client Side Errors
  getClientMessage(error: Error): string {
    if (!navigator.onLine) {
      return 'No Internet Connection';
    }
    return error.message ? error.message : error.toString();
  }

  getClientStack(error: Error): string {
    return error.stack;
  }

  initErrorHandler(errors) {

    this.zone.run(() => {
      {
        let _snackBarRef: MatSnackBarRef<any> = this._snackBar.open("There was an internal error, please contact technical support.", 'copy', { duration: 3000 })
        _snackBarRef.afterDismissed().subscribe(() => {
          console.log("afterDismissed")
          let listener = (e: ClipboardEvent) => {
            let clipboard = e.clipboardData || window["clipboardData"];
            clipboard.setData("text", errors);
            e.preventDefault();
          };

          document.addEventListener("copy", listener, false)
          let copied: EventEmitter<string> = new EventEmitter<string>();
          copied.emit(errors[2]);
          document.execCommand("copy");
          document.removeEventListener("copy", listener, false);
        })
      }
    });
  }
}
