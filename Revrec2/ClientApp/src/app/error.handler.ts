
import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorService: ErrorService) {
  }

  handleError(error) {
    let errorMessage = '';
    if (error instanceof HttpErrorResponse) {
      // server-side error {HttpErrorResponse} 
      console.error('Server ERROR', error);
      this.errorService.addServerErrors(error);
    } else {
      // client-side error
      console.error('CLIENT ERROR', error)
    }
  }
}