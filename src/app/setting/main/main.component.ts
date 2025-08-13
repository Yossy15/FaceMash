import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { NgFor, NgIf } from '@angular/common';
import { StorageUtil } from '../../utils/storage.util';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangpasswordComponent } from '../../editprofile/changpassword/changpassword.component';
import { ChnameComponent } from '../../editprofile/chname/chname.component';
import { ChAvatarimgComponent } from '../../editprofile/ch-avatarimg/ch-avatarimg.component';
import { AddimagesComponent } from '../addimages/addimages.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
    NgFor,
    NgIf
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  userId: any;
  avatar_img: any;
  name: any;
  email: any;
  images: any[] = [];
  aid: any;
  id: any;

  constructor(
     private authService: AuthService,
    private route: ActivatedRoute,
    private imageService: ImageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // ดึงข้อมูลผู้ใช้จาก query parameter และ API ก่อน
      this.getUsedetail();
      // รอให้ได้ข้อมูลจาก API แล้วค่อยเรียก getOnlyone
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  private loadUserFromLocalStorage() {
    const userData = StorageUtil.getUserData();
    this.aid = userData.aid;
    this.avatar_img = userData.avatar_img;
    this.name = userData.name;
    this.email = userData.email;

    console.log("LocalStorage data loaded after API call:", {
      aid: this.aid,
      avatar_img: this.avatar_img,
      name: this.name,
      email: this.email
    });
  }

  getUsedetail() {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      console.log('Received userId from query params:', this.userId);
    });
    this.authService.getUsedetail(this.userId)
      .subscribe((response: any) => {
        // ตรวจสอบ response structure ก่อน
        console.log('Main: Full API response:', response);
        console.log('Main: Response keys:', Object.keys(response));
        
        // ใช้ aid จาก response โดยตรง (ไม่ใช่ this.aid)
        const responseAid = response?.aid;
        this.aid = responseAid;
        this.avatar_img = response?.avatar_img;
        this.name = response?.name;
        this.email = response?.email;

        StorageUtil.setUserData({
          aid: this.aid,
          avatar_img: this.avatar_img,
          name: this.name,
          email: this.email
        });
       
        console.log('Main: User details from API:', response);
        console.log('Main: Response aid field:', responseAid);
        console.log('Main: Component aid value:', this.aid);
        
        // หลังจากได้ข้อมูลจาก API แล้ว ให้โหลดข้อมูลจาก localStorage และเรียก getOnlyone
        this.loadUserFromLocalStorage();
        this.getOnlyone();
        
        // Debug: ตรวจสอบ aid ที่จะใช้ในการส่ง query parameter
        console.log('Main: aid ready for navigation:', this.aid);
        
        // ตรวจสอบว่า aid ไม่เป็น undefined
        if (!this.aid) {
          console.error('Main: aid is undefined!');
        }
      }, (error) => {
        console.error("Error occurred while fetching user details:", error);
      });
  }

  getOnlyone() {
    console.log('Using aid in getOnlyone:', this.aid);

    this.imageService.getOnly(this.aid).subscribe({
      next: data => {
        if (Array.isArray(data) && data.length > 0) {
          this.images = data;
          this.id = data[0]._id; // เอาตัวแรก
          StorageUtil.setItem('image_id', this.id);
          console.log('Fetched single image:', data);
        } else {
          console.warn('No image data returned');
        }
      },
      error: err => {
        console.error('Error fetching image:', err);
      }
    });
  }


  changepw() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px";
    dialogConfig.width = "1000px";
    this.dialog.open(ChangpasswordComponent, dialogConfig);
  }

  changename() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px";
    dialogConfig.width = "1000px";
    this.dialog.open(ChnameComponent, dialogConfig);
  }

  changeAvatar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px";
    dialogConfig.width = "1000px";
    this.dialog.open(ChAvatarimgComponent, dialogConfig);
  }
}
