import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-signup-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTabsModule],
  templateUrl: './login-signup-dialog.component.html',
  styleUrl: './login-signup-dialog.component.scss'
})
export class LoginSignupDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<LoginSignupDialogComponent>,
    private router: Router
  ) { }

  // ไปหน้า login
  goToLogin() {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }

  // ไปหน้าสมัคร
  goToSignup() {
    this.dialogRef.close();
    this.router.navigate(['/signup']);
  }

  // ปิดป็อปอัพ
  closeDialog() {
    this.dialogRef.close();
  }
}
