import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ImageService } from '../../../services/image.service';
import { CommonModule } from '@angular/common';
import { StorageUtil } from '../../../utils/storage.util';

@Component({
  selector: 'app-showprofile',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './showprofile.component.html',
  styleUrls: ['./showprofile.component.scss']  // <-- แก้ที่นี่
})
export class ShowprofileComponent implements OnInit {
  images: any[] = [];
  aid: any;
  avatar_img: any;
  name: any;
  email: any;
  defaultAvatar: string = "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private imageService: ImageService
  ) {
    this.aid = data.aid;
    console.log("Received aid from dialog:", this.aid);
  }

  ngOnInit(): void {
    this.getUsedetail();
    this.getOnlyone();
  }

  getUsedetail() {
    if (!this.aid) {
      console.error("aid is not provided");
      return;
    }

    this.authService.getUsedetail(this.aid).subscribe(
      (response: any) => {
        this.avatar_img = response?.avatar_img || "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
        this.name = response?.name;
        this.email = response?.email;

        console.log(`User details fetched: aid=${this.aid}, avatar_img=${this.avatar_img}, name=${this.name}, email=${this.email}`);
      },
      (error) => {
        console.error("Error occurred while fetching user details:", error);
      }
    );
  }

  getOnlyone() {
    this.imageService.getOnly(this.aid).subscribe(
      data => {
        this.images = data;
        console.log("Images sss:", this.images);
        if (Array.isArray(data) && data.length > 0) {
          this.aid = data[0]?.images_id;
          StorageUtil.setItem('aid', this.aid);
        }
      },
      error => {
        console.error(error);
      }
    );
  }
}


