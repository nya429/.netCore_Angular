import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { failScaleTrigger } from '../auth.animation';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [failScaleTrigger]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  scaleState: string;
  signinStateSubcription: Subscription;

  constructor(private authService: AuthService,
              private router: Router) {}

  ngOnInit() {
    this.scaleState = 'default';
    this.initForm();
    this.signinStateSubcription = this.authService.signinStateChanged.subscribe(
      (state: string) => this.onSigninStateChange(state)
    )
  }

  initForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', {
        validators: [Validators.required]
      }),
      password: new FormControl('', { validators: [Validators.required] })
    });
  }

  onSubmit() {
    console.log(this.loginForm.value);
    this.authService.signinUser(this.loginForm.value)
  }

  onSigninStateChange(state) {
    switch(state) {
      case 'authed':
        this. stateSuccess(state);
        break;
      case 'fail':
        this.stateFail(state);
        break;
    default:
      break;
    }
  }

  stateFail(state) {
    this.scaleState = state;
    setTimeout(() => {
      this.scaleState = 'default';
    }, 100);
  }

  stateSuccess(state) {
    this.scaleState = state;
    setTimeout(() => {
        this.router.navigate(['/members']);
    }, 400);
  }
  
}
