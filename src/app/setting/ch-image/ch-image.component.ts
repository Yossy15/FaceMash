import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SnackbarService } from '../../services/snackbar.service';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute } from '@angular/router';
import { ImageUploadService } from '../../services/upload-service.service';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ch-image',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './ch-image.component.html',
  styleUrl: './ch-image.component.scss'
})
export class ChImageComponent {
  downloadURL1: any;
  mid: any;
  userId: any;
  avatar_img: any;
  name: any;
  email: any;
  images: any[] = [];
  aid: any;
  downloadURL: any;
  selectedImage: string | ArrayBuffer | null = null;
  constructor(private authService: AuthService,private imageService: ImageService, private route: ActivatedRoute,private uploadService: ImageUploadService,private router:Router,) { }

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
            localStorage.setItem('aid', this.aid);
            localStorage.setItem('avatar_img', this.avatar_img);
            localStorage.setItem('name', this.name);
            localStorage.setItem('email', this.email);

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

  updateImage(image_url: any, Image_id:any) {
      this.imageService.updateImg(image_url, Image_id).subscribe(
        response => {
          console.log('Image updated successfully', response);
          this.router.navigate(['/main'], { queryParams: { userId: this.aid } });
        },
        error => {
          console.error('Error updating image', image_url, Image_id);
        }
      );
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
        this.downloadURL1 = downloadURL;
        
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
  }
}
