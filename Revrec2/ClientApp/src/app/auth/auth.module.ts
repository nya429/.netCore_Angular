import { AuthService } from './auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule, MatButtonModule } from '@angular/material';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { MaterialModule } from '../material.module';

@NgModule({
  imports: [
    // CommonModule,
    // BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    UnauthorizedComponent
  ],
  declarations: [
    SignupComponent, 
    LoginComponent,
    UnauthorizedComponent 
  ],
  providers: [
  ]
})
export class AuthModule { }
