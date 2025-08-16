import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationComponent } from '../navigation/navigation.component';
import { PreviousRankPipe } from '../../previous-rank.pipe';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgClass, NgFor, SlicePipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ShowprofileComponent } from '../posts/showprofile/showprofile.component';
import { StorageUtil } from '../../utils/storage.util';

@Component({
  selector: 'app-topten',
  standalone: true,
  imports: [ NgIf, NgClass, NgFor, SlicePipe, MatCardModule, RouterLink, NgFor, MatToolbarModule, NavigationComponent, PreviousRankPipe, HttpClientModule
  ],
  templateUrl: './topten.component.html',
  styleUrl: './topten.component.scss'
})
export class ToptenComponent implements OnInit {
  images: any;
  topTenImages: any[] = [];
  previousTopTenImages: any[] = [];
  avatar_img: any;
  name: any;
  email: any;
  aid: any;
  userId: any;

  constructor(private imageService: ImageService,
    private authService: AuthService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getTopTenImages();
    
    // ใช้ StorageUtil แทน localStorage
    const userData = StorageUtil.getUserData();
    this.aid = userData.aid;
    this.avatar_img = userData.avatar_img;
    this.name = userData.name;
    this.email = userData.email;
    console.log("Topten: User data from StorageUtil:", { aid: this.aid, avatar_img: this.avatar_img, name: this.name, email: this.email });
  }

  getTopTenImages(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imageService.getAllImages().subscribe(
        (data: any) => {
          const sortedData = data.slice().sort((a: any, b: any) => b.points - a.points);

          // เก็บ top ten เดิมก่อน (ถ้ามี)
          this.previousTopTenImages = this.topTenImages || [];

          // ตัดเอาแค่ 10 อันดับแรก
          this.topTenImages = sortedData.slice(0, 10);

          // กรองเอาข้อมูลเจ้าของภาพมาเติมในแต่ละ item
          const userDetailPromises = this.topTenImages.map((img: any) => {
            return this.authService.getUsedetail(img.facemash_id).toPromise()
              .then((user: any) => {
                img.name = user.name;
                img.avatar_img = user.avatar_img;
                return img;
              })
              .catch(err => {
                console.error(`Failed to fetch user detail for ${img.facemash_id}`, err);
                return img; // คืนค่าเดิมถ้าดึงข้อมูล user ไม่ได้
              });
          });

          Promise.all(userDetailPromises).then(() => {
            resolve(this.topTenImages);
          });

        },
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  viewProfile(facemashId: any) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '1000px';
      dialogConfig.height = '600px';
      dialogConfig.data = { aid: facemashId };
      this.dialog.open(ShowprofileComponent, dialogConfig);
    }

}

