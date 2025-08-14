import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { EloService } from '../../services/elo.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { StorageUtil } from '../../utils/storage.util';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationComponent } from '../navigation/navigation.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ShowprofileComponent } from './showprofile/showprofile.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NavigationComponent,
    RouterLink,
    NgIf
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  images: any[] = [];
  character1Image: any = null;
  character2Image: any = null;
  originalCharacter1Image: any = null;
  originalCharacter2Image: any = null;

  aid: any | null = null;
  avatar_img: any | null = null;
  name: any | null = null;
  email: any | null = null;

  constructor(
    private imageService: ImageService,
    private eloService: EloService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // ดึงรายละเอียดผู้ใช้จาก URL query parameters ก่อน
      this.getUsedetail();
      // ดึงภาพทั้งหมดและสุ่มภาพเริ่มต้น
      this.getAllImages();
      // โหลดข้อมูลผู้ใช้จาก localStorage หลังจากได้ข้อมูลจาก API แล้ว
      this.loadUserFromLocalStorage();
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  getUsedetail() {
    this.route.queryParams.subscribe(params => {
      // Get the value of 'userId' parameter from the URL
      this.aid = params['userId'];
      console.log('Posts: Received userId from query params:', this.aid);
      
      // เรียก API หลังจากได้ userId จาก query params แล้ว
      if (this.aid) {
        this.authService.getUsedetail(this.aid)
          .subscribe((response: any) => {

            // ตรวจสอบ response structure ก่อน
            console.log('Full API response:', response);
            console.log('Response keys:', Object.keys(response));
            
            // ใช้ aid จาก response โดยตรง (ไม่ใช่ this.aid)
            const responseAid = response?.aid;
            this.aid = responseAid;
            this.avatar_img = response?.avatar_img;
            this.name = response?.name;
            this.email = response?.email;

                    // Set values in localStorage - เก็บ aid ด้วย
        StorageUtil.setUserData({
          aid: this.aid,
          avatar_img: this.avatar_img,
          name: this.name,
          email: this.email
        });

            console.log('Response aid field:', responseAid);
            console.log('Component aid value:', this.aid);
            console.log('Avatar:', response?.avatar_img);
            console.log('Name:', response?.name);
            console.log('Email:', response?.email);
            
            // ตรวจสอบว่า aid ไม่เป็น undefined
            if (!this.aid) {
              console.error('Posts: aid is undefined after API call!');
              console.error('Response structure:', response);
            }

          }, (error) => {
            console.error("Error occurred while fetching user details:", error);
          });
      } else {
        console.error('No userId found in query params');
      }
    });
  }

  private loadUserFromLocalStorage() {
    const userData = StorageUtil.getUserData();
    this.aid = userData.aid;
    this.avatar_img = userData.avatar_img;
    this.name = userData.name;
    this.email = userData.email;

    console.log("LocalStorage data loaded in posts:", {
      aid: this.aid,
      avatar_img: this.avatar_img,
      name: this.name,
      email: this.email
    });
  }

  checkAidBeforeNavigation() {
    console.log('Posts: Checking aid before navigation:', this.aid);
    if (!this.aid) {
      console.error('Posts: Cannot navigate - aid is undefined!');
      // ลองดึงจาก localStorage อีกครั้ง
      this.aid = StorageUtil.getItem('aid');
      console.log('Posts: aid from localStorage:', this.aid);
      
      // ถ้ายังเป็น undefined ให้ใช้ userId จาก query params
      if (!this.aid) {
        this.route.queryParams.subscribe(params => {
          this.aid = params['userId'];
          console.log('Posts: Using userId from query params as aid:', this.aid);
        });
      }
    }
    
    // แสดงค่า aid ที่จะใช้ในการ navigate
    console.log('Posts: Final aid for navigation:', this.aid);
  }

  getAllImages() {
    this.imageService.getAllImages().subscribe({
      next: (data: any[]) => {
        console.log('Fetched images:', data);
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
      } while (idx1 === idx2 || this.images[idx1].facemash_id === this.images[idx2].facemash_id
        || this.images[idx1].facemash_id === this.aid || this.images[idx2].facemash_id === this.aid
      );

      this.character1Image = {...this.images[idx1]};
      this.character2Image = {...this.images[idx2]};
      this.originalCharacter1Image = {...this.character1Image};
      this.originalCharacter2Image = {...this.character2Image};

      console.log('Character 1:', this.character1Image);
      console.log('Character 2:', this.character2Image);

      // ดึงข้อมูล user name และ avatar จาก backend
      this.authService.getUsedetail(this.character1Image.facemash_id).subscribe(user1 => {
        this.character1Image.name = user1.name;
        this.character1Image.avatar_img = user1.avatar_img;
      });

      this.authService.getUsedetail(this.character2Image.facemash_id).subscribe(user2 => {
        this.character2Image.name = user2.name;
        this.character2Image.avatar_img = user2.avatar_img;
      });
      console.log(this.aid);
    } else {
      console.warn('ไม่พบภาพเพียงพอสำหรับการสุ่ม');
    }
  }

  onClickC1() {
    this.updateRatings(true);
  }

  onClickC2() {
    this.updateRatings(false);
  }

  private updateRatings(character1Wins: boolean) {
    if (!this.character1Image || !this.character2Image) return;
  
    // ใช้ฟังก์ชันใหม่ใน EloService
    const { player1New, player2New } = this.eloService.calculateMatchResult(
      this.character1Image.points,
      this.character2Image.points,
      character1Wins
    );
  
    // อัปเดตค่าบนตัวแปร
    this.character1Image.points = player1New;
    this.character2Image.points = player2New;
  
    // ส่ง request พร้อมกัน
    forkJoin([
      this.imageService.updatePoints(this.character1Image._id, player1New),
      this.imageService.updatePoints(this.character2Image._id, player2New)
    ]).subscribe({
      next: ([res1, res2]) => {
        console.log('Points updated successfully', res1, res2);
        this.randomizeImages();
      },
      error: err => console.error('Failed to update points:', err)
    });
    this.randomizeImages();
  }

    
  

  private fetchUserDetails(aid: any) {
    this.authService.getUsedetail(aid).subscribe({
      next: (response: any) => {
        this.aid = response?.aid || this.aid;
        this.avatar_img = response?.avatar_img || this.avatar_img;
        this.name = response?.name || this.name;
        this.email = response?.email || this.email;

        console.log('User details fetched successfully:', {
          aid: this.aid,
          avatar_img: this.avatar_img,
          name: this.name,
          email: this.email
        });
      },
      error: error => {
        console.error('Error occurred while fetching user details:', error);
      }
    });
  }

  viewProfile(facemashId: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1000px';
    dialogConfig.height = '600px';
    dialogConfig.data = { aid: facemashId };
    this.dialog.open(ShowprofileComponent, dialogConfig);
  }

  logout() {
    // ล้างข้อมูลใน localStorage
    StorageUtil.clear();
    
    // รีเซ็ตตัวแปร
    this.aid = null;
    this.avatar_img = null;
    this.name = null;
    this.email = null;
    
    console.log('Logged out successfully');
    
    // รีโหลดหน้าเพื่อแสดงสถานะใหม่
    this.router.navigate(['/']);
  }
}
