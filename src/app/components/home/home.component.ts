import { Component, OnInit } from '@angular/core';
import { EloService } from '../../services/elo.service';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationComponent } from '../navigation/navigation.component';
import { ShowprofileComponent } from '../posts/showprofile/showprofile.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { LoginSignupDialogComponent } from './login-signup-dialog/login-signup-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NavigationComponent,
    RouterLink,
    NgIf,
    HttpClientModule,
    NgFor
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  images: any[] = [];
  character1Image: any = null;
  character2Image: any = null;
  originalCharacter1Image: any = null;
  originalCharacter2Image: any = null;

  aid: any | null = null;
  avatar_img: any;
  name: any | null = null;
  email: any | null = null;

  constructor(
    private imageService: ImageService,
    private eloService: EloService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // โหลดข้อมูลผู้ใช้จาก localStorage ก่อน
      this.loadUserFromLocalStorage();

      // ดึงภาพทั้งหมดและสุ่มภาพเริ่มต้น
      this.getAllImages();
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  private loadUserFromLocalStorage() {
    this.aid = localStorage.getItem('aid');
    this.avatar_img = localStorage.getItem('avatar_img') || "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
    this.name = localStorage.getItem('name');
    this.email = localStorage.getItem('email');

    console.log("LocalStorage data loaded:", {
      aid: this.aid,
      avatar_img: this.avatar_img,
      name: this.name,
      email: this.email
    });
  }

  // ตรวจสอบสถานะ login
  isLoggedIn(): boolean {
    return !!this.aid;
  }



  // ฟังก์ชัน logout
  logout() {
    // ล้างข้อมูลใน localStorage
    localStorage.clear();
    
    // รีเซ็ตตัวแปร
    this.aid = null;
    this.avatar_img = null;
    this.name = null;
    this.email = null;
    
    console.log('Logged out successfully');
    
    // รีโหลดหน้าเพื่อแสดงสถานะใหม่
    window.location.reload();
  }

    getUsedetail() {
    if (!this.aid) {
      console.error("aid is not provided");
      return;
    }

    this.authService.getUsedetail(this.aid).subscribe(
      (data: any) => {
        this.avatar_img = data.avatar_img;
        this.name = data.name;  
        this.email = data.email;
        console.log("User details:", data);

        // อัพเดต localStorage ด้วยข้อมูลที่ดึงมา
        localStorage.setItem('avatar_img', this.avatar_img);
        localStorage.setItem('name', this.name);
        localStorage.setItem('email', this.email);
        localStorage.setItem('aid', this.aid);
  
    
        console.log("LocalStorage updated with avatar_img, name, and email");
        console.log("Avatar Image:", this.avatar_img);
        console.log("Name:", this.name);
        console.log("Email:", this.email);
      },
      (error) => {
        console.error("Error occurred while fetching user details:", error);
      }
    );
  }
  getAllImages() {
    this.imageService.getAllImages().subscribe({
      next: (data: any[]) => {
        // console.log('Fetched images:', data);
        this.images = data;
        this.randomizeImages();
      },
      error: (error) => {
        console.error('Error fetching images:', error);
      }
    });
  }

  randomizeImages() {
    if (this.images.length > 1) {
      let idx1: number, idx2: number;
      do {
        idx1 = Math.floor(Math.random() * this.images.length);
        idx2 = Math.floor(Math.random() * this.images.length);
      } while (idx1 === idx2);

      this.character1Image = {...this.images[idx1]};
      this.character2Image = {...this.images[idx2]};
      this.originalCharacter1Image = {...this.character1Image};
      this.originalCharacter2Image = {...this.character2Image};

      // console.log('Character 1:', this.character1Image);
      // console.log('Character 2:', this.character2Image);

      // ดึงข้อมูล user name และ avatar จาก backend
      this.authService.getUsedetail(this.character1Image.facemash_id).subscribe(user1 => {
        this.character1Image.name = user1.name;
        this.character1Image.avatar_img = user1.avatar_img;
      });

      this.authService.getUsedetail(this.character2Image.facemash_id).subscribe(user2 => {
        this.character2Image.name = user2.name;
        this.character2Image.avatar_img = user2.avatar_img;
      });

    } else {
      console.warn('ไม่พบภาพเพียงพอสำหรับการสุ่ม');
    }
  }

  // ฟังก์ชันสำหรับการสุ่มภาพใหม่ (เฉพาะเมื่อ login แล้ว)
  randomizeImagesAfterVote() {
    if (this.isLoggedIn()) {
      this.randomizeImages();
    }
  }

  onClickC1() {
    if (this.isLoggedIn()) {
      this.updateRatings(true);
    } else {
      console.log('Please login to vote');
      this.showLoginSignupDialog();
    }
  }

  onClickC2() {
    if (this.isLoggedIn()) {
      this.updateRatings(false);
    } else {
      console.log('Please login to vote');
      this.showLoginSignupDialog();
    }
  }

  // แสดงป็อปอัพ login/signup
  showLoginSignupDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'login-signup-dialog-container';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;

    this.dialog.open(LoginSignupDialogComponent, dialogConfig);
  }

  private updateRatings(character1Wins: boolean) {
    // ตรวจสอบสถานะ login อีกครั้งเพื่อความปลอดภัย
    if (!this.isLoggedIn()) {
      console.log('User not logged in, cannot update ratings');
      return;
    }

    if (!this.character1Image || !this.character2Image) return;

    const newRating1 = this.eloService.calculateNewRating(
      this.character1Image.points,
      this.character2Image.points,
      character1Wins
    );
    const newRating2 = this.eloService.calculateNewRating(
      this.character2Image.points,
      this.character1Image.points,
      !character1Wins
    );

    this.character1Image.points = newRating1;
    this.character2Image.points = newRating2;

    this.imageService.updatePoints(this.character1Image._id, newRating1).subscribe({
      next: data => console.log('Character 1 points updated successfully', data),
      error: err => console.error('Failed to update Character 1 points:', err)
    });

    this.imageService.updatePoints(this.character2Image._id, newRating2).subscribe({
      next: data => console.log('Character 2 points updated successfully', data),
      error: err => console.error('Failed to update Character 2 points:', err)
    });

    // สุ่มภาพใหม่เฉพาะเมื่อ login แล้ว
    this.randomizeImagesAfterVote();
  }

  // private fetchUserDetails(aid: any) {
  //   this.authService.getUsedetail(aid).subscribe({
  //     next: (response: any) => {
  //       this.aid = response?.aid || this.aid;
  //       this.avatar_img = response?.avatar_img || this.avatar_img;
  //       this.name = response?.name || this.name;
  //       this.email = response?.email || this.email;

  //       console.log('User details fetched successfully:', {
  //         aid: this.aid,
  //         avatar_img: this.avatar_img,
  //         name: this.name,
  //         email: this.email
  //       });
  //     },
  //     error: error => {
  //       console.error('Error occurred while fetching user details:', error);
  //     }
  //   });
  // }

  viewProfile(facemashId: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1000px';
    dialogConfig.height = '600px';
    dialogConfig.data = { aid: facemashId };
    this.dialog.open(ShowprofileComponent, dialogConfig);
  }
}
