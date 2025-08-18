import { NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { StorageUtil } from '../../utils/storage.util';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ImageUploadService } from '../../services/upload-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addimages',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
    NgFor,
    NgIf,
    FormsModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './addimages.component.html',
  styleUrl: './addimages.component.scss'
})
export class AddimagesComponent {
  userId: any;
  avatar_img: any;
  name: any;
  email: any;
  images: any[] = [];
  aid: any;
  downloadURL: any;
  selectedImage: string | ArrayBuffer | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private uploadService: ImageUploadService,
    private imageService: ImageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // ดึงข้อมูลผู้ใช้จาก query parameter และ API ก่อน
      this.getUsedetail();
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  getUsedetail() {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      console.log('AddImage: Received userId from query params:', this.userId);
      
      if (!this.userId) {
        console.error("AddImage: userId not found in query params");
        return;
      }

      this.authService.getUsedetail(this.userId)
        .subscribe(
          (response: any) => {
            // ตรวจสอบ response structure ก่อน
            console.log('AddImage: Full API response:', response);
            console.log('AddImage: Response keys:', Object.keys(response));
            
            // ใช้ aid จาก response โดยตรง
            const responseAid = response?.aid;
            this.aid = responseAid;
            this.avatar_img = response?.avatar_img;
            this.name = response?.name;
            this.email = response?.email;

                    // เก็บข้อมูลใน localStorage
        StorageUtil.setUserData({
          aid: this.aid,
          avatar_img: this.avatar_img,
          name: this.name,
          email: this.email
        });

            console.log('AddImage: Response aid field:', responseAid);
            console.log('AddImage: Component aid value:', this.aid);
            console.log('AddImage: Avatar:', response?.avatar_img);
            console.log('AddImage: Name:', response?.name);
            console.log('AddImage: Email:', response?.email);
            
            // ตรวจสอบว่า aid ไม่เป็น undefined
            if (!this.aid) {
              console.error('AddImage: aid is undefined after API call!');
              console.error('Response structure:', response);
            }
          },
          (error) => {
            console.error("Error occurred while fetching user details:", error);
          }
        );
    });
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

  checkAidBeforeNavigation() {
    console.log('AddImage: Checking aid before navigation:', this.aid);
    if (!this.aid) {
      console.error('AddImage: Cannot navigate - aid is undefined!');
      // ลองดึงจาก localStorage อีกครั้ง
      this.aid = StorageUtil.getItem('aid');
      console.log('AddImage: aid from localStorage:', this.aid);
      
      // ถ้ายังเป็น undefined ให้ใช้ userId จาก query params
      if (!this.aid) {
        this.route.queryParams.subscribe(params => {
          this.aid = params['userId'];
          console.log('AddImage: Using userId from query params as aid:', this.aid);
        });
      }
    }
    
    // แสดงค่า aid ที่จะใช้ในการ navigate
    console.log('AddImage: Final aid for navigation:', this.aid);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.uploadService.uploadFile(file)
      .then(downloadURL => {
        console.log('File uploaded successfully. Download URL:', downloadURL);
        this.downloadURL = downloadURL;
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    if (file) {
      // Set selected image URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.selectedImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getAdd(): void {
    if (this.downloadURL) {
      const image_url = this.downloadURL;
      const fashmash_id = this.aid;
      console.log(`Adding image with URL: ${image_url} and facemash_id: ${fashmash_id}`);
      this.imageService.getAdd(image_url, fashmash_id).subscribe(
        () => {
          console.log('Image added successfully');
          this.router.navigate(['/main'], { queryParams: { userId: this.aid } });
        },
        error => {
          console.error('Error adding image:', error);
        }
      );
    } else {
      console.error('Download URL is null.');
    }
  }
}
