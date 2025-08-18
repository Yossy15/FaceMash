import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ImageService } from '../../services/image.service';
import { Router } from '@angular/router';
import { ChImageComponent } from '../ch-image/ch-image.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-editimages',
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
    MatIconModule
  ],
  templateUrl: './editimages.component.html',
  styleUrl: './editimages.component.scss'
})
export class EditimagesComponent {
  userId: any;
  avatar_img: any;
  name: any;
  email: any;
  images: any;
  aid: any;
  id: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private imageService: ImageService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      
      this.loadUserFromLocalStorage();this.getOnlyoneimage();
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  private loadUserFromLocalStorage() {
    this.aid = localStorage.getItem('aid');
    this.avatar_img = localStorage.getItem('avatar_img') || "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
    this.name = localStorage.getItem('name');
    this.email = localStorage.getItem('email');

    console.log("LocalStorage data loaded in posts:", {
      aid: this.aid,
      avatar_img: this.avatar_img,
      name: this.name,
      email: this.email
    });
  }

  getOnlyoneimage() {
    this.route.params.subscribe(params => {
      const id = this.id || params['id']; // ใช้ id จาก localStorage หรือจาก params

      this.imageService.getOnlyimage(id).subscribe(
        data => {
          console.log('RAW image data:', data);
          this.images = [data];  // กำหนดเป็น array
          if (this.images.length > 0) {
            this.id = this.images[0]._id;  // ✔️ ใช้ index 0
            // localStorage.setItem('_id', this.id);
          }
        },
        error => {
          console.error('Error loading image:', error);
        }
      );
    });
  }

  logout() {
    // ล้างข้อมูลใน localStorage
    // StorageUtil.clear();
    
    // รีเซ็ตตัวแปร
    this.aid = null;
    this.avatar_img = null;
    this.name = null;
    this.email = null;
    
    console.log('Logged out successfully');
    
    // รีโหลดหน้าเพื่อแสดงสถานะใหม่
    this.router.navigate(['/']);
  }
  
  deleteImage(imageId: string) {
    if (!imageId) return;
    this.imageService.delete(imageId).subscribe({
      next: () => {
        console.log('Deleted image', imageId);
        // รีเฟรชข้อมูลใหม่หลังลบ
        this.getOnlyoneimage();
      },
      error: err => console.error(err)
    });
  }


  chImage() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px";
    dialogConfig.width = "1000px";
    this.dialog.open(ChImageComponent, dialogConfig);
  }
}
