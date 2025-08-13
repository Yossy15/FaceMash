import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { SnackbarService } from '../../services/snackbar.service';
import { GlobalConstants } from '../../global/global-constants';
import { Router } from '@angular/router';
import jwt_decode, { jwtDecode } from 'jwt-decode';
import { StorageUtil } from '../../utils/storage.util';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    RouterLink,
    MatDividerModule,
    MatToolbarModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  responseMessage: any;
  actype: any;
  errorMessage: string = '';
  aid: any;

  constructor(private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService) {
    this.loginForm = this.createFormGroup();
  }

  ngOnInit(): void {
    this.loginForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),//ตรวจสอบค่าที่รับมามีรูปแบบของอีเมล์
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(7)]),
    })
  }

  login() {
  this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
    .subscribe((response: any) => {
      // เก็บ token
      StorageUtil.setItem("token", response.token);

      let decodedToken: any;
      try {
        decodedToken = jwtDecode(response.token);
        console.log('Decoded token userId:', decodedToken.userId);

        // ล้างข้อมูลเก่าใน localStorage ก่อน
        StorageUtil.removeItem('aid');
        StorageUtil.removeItem('avatar_img');
        StorageUtil.removeItem('name');
        StorageUtil.removeItem('email');
        StorageUtil.removeItem('_id');
        
        // เก็บข้อมูลใหม่ใน localStorage
        StorageUtil.setItem("aid", decodedToken.userId);
        this.aid = decodedToken.userId;

      } catch (err) {
        StorageUtil.clear();
        this.router.navigate(["login"]);
        return;
      }

      this.responseMessage = response?.message;
      this.actype = response?.actype;
      this.snackbarService.openSnackBar(this.responseMessage, "");

      if (this.responseMessage === "Login successfully") {
        if (this.actype === "user") {
          this.router.navigate(["posts"], { queryParams: { userId: this.aid } });
        } else if (this.actype === "admin") {
          this.router.navigate(["dashboard"], { queryParams: { userId: decodedToken.userId } });
        }
      } else {
        this.router.navigate(["login"]);
      }
    }, (error) => {
      console.error('Error occurred:', error);
      if (error.status === 401) {
        this.errorMessage = 'Wrong password!';
      } else {
        this.errorMessage = 'An error occurred. Please try again later.';
      }
      this.snackbarService.openSnackBar(this.errorMessage, 'error');
    });
}



}


