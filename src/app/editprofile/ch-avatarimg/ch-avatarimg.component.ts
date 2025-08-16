import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { SnackbarService } from '../../services/snackbar.service';
import { ImageUploadService } from '../../services/upload-service.service';
import { AuthService } from '../../services/auth.service';
import { StorageUtil } from '../../utils/storage.util';

@Component({
  selector: 'app-ch-avatarimg',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    RouterLink],
  templateUrl: './ch-avatarimg.component.html',
  styleUrl: './ch-avatarimg.component.scss'
})
export class ChAvatarimgComponent implements OnInit {
  errorMessage: string = '';
  AvatarForm: FormGroup = new FormGroup({});
  aid: any;
  avatar_img: any;
  selectedImage: any;
  newAvatarImg: any;

  constructor(private http: HttpClient,
    private snackbarService: SnackbarService,
    private uploadService: ImageUploadService,
    private authService: AuthService) { 
    console.log('ChAvatarimg: Component constructor called');
  }

  ngOnInit(): void {
    console.log('ChAvatarimg: ngOnInit called');
    this.AvatarForm = this.createFormGroup();

    // ใช้ StorageUtil แทน localStorage
    const userData = StorageUtil.getUserData();
    this.aid = userData.aid;
    this.avatar_img = userData.avatar_img;
    console.log('ChAvatarimg: aid from StorageUtil:', this.aid);
    console.log('ChAvatarimg: avatar_img from StorageUtil:', this.avatar_img);
    console.log('ChAvatarimg: userData from StorageUtil:', userData);

    if (this.aid) {
      const userIdControl = this.AvatarForm.get('userId');
      if (userIdControl !== null) { // Null check
        userIdControl.setValue(this.aid);
        console.log('ChAvatarimg: userId control set to:', this.aid);
      } else {
        console.error('ChAvatarimg: userId control is null');
      }
    } else {
      console.error('ChAvatarimg: aid is null or undefined');
    }

    // ตรวจสอบว่า avatar_img ไม่ใช่ default image
    const defaultAvatar = "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
    if (this.avatar_img === defaultAvatar) {
      this.avatar_img = null;
      console.log('ChAvatarimg: Using null avatar_img instead of default image');
    } else {
      console.log('ChAvatarimg: avatar_img is not default image:', this.avatar_img);
    }

    this.selectedImage = this.avatar_img;
    console.log('ChAvatarimg: selectedImage set to:', this.selectedImage);

    this.changeAvatarImg = this.changeAvatarImg.bind(this);
    console.log('ChAvatarimg: ngOnInit completed');
  }

  createFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      userId: new FormControl('', Validators.required),
      newAvatarImg: new FormControl('', Validators.required),
    });
    console.log('ChAvatarimg: Form group created:', formGroup);
    return formGroup;
  }

  changeAvatarImg() { 
    if (this.AvatarForm.invalid) {
      return;
    }

    const body = this.AvatarForm.value;
    console.log(body);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.put<any>('https://api-facmash.onrender.com/auth/change-avatar', body, { headers }) 
      .subscribe({
        next: () => {
          console.log('Avatar changed successfully.'); 
          this.snackbarService.openSnackBar('Avatar changed successfully.', 'success');
          this.AvatarForm.reset();
          this.errorMessage = '';
          
          // แจ้งเตือนผ่าน service
          // this.avatarUpdateService.notifyAvatarUpdate(this.newAvatarImg);
          
          // รีเฟรชหน้าหลังจาก 2 วินาที
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (error) => {
          console.error('Error occurred:', error);
          this.errorMessage = 'An error occurred. Please try again later.';
          this.snackbarService.openSnackBar(this.errorMessage, 'error');
        }
      });
  }

  onFileSelected(event: any): void {
    console.log('ChAvatarimg: onFileSelected called');
    const file: File = event.target.files[0];
    if (file) {
      console.log('ChAvatarimg: File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      this.uploadFile(file);
    } else {
      console.error('ChAvatarimg: No file selected');
      this.snackbarService.openSnackBar('Please select a file.', 'error');
    }
  }

  uploadFile(file: File): void {
    console.log('ChAvatarimg: uploadFile method called');
    console.log('ChAvatarimg: Starting file upload for file:', file.name);
    console.log('ChAvatarimg: File size:', file.size, 'bytes');
    console.log('ChAvatarimg: File type:', file.type);
    
    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('ChAvatarimg: File too large:', file.size, 'bytes');
      this.snackbarService.openSnackBar('File too large. Please select a file smaller than 5MB.', 'error');
      return;
    }
    
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      console.error('ChAvatarimg: Invalid file type:', file.type);
      this.snackbarService.openSnackBar('Please select an image file.', 'error');
      return;
    }
    
    console.log('ChAvatarimg: About to call uploadService.uploadFile');
    this.uploadService.uploadFile(file)
              .then(downloadURL => {
          console.log('ChAvatarimg: uploadService.uploadFile promise resolved');
          console.log('ChAvatarimg: File uploaded successfully. Download URL:', downloadURL);
        
                 // ตรวจสอบว่า downloadURL เป็น URL ที่ถูกต้อง
         if (!downloadURL || !downloadURL.startsWith('http')) {
           throw new Error('Invalid download URL received from upload service');
         }

         // ตรวจสอบว่า downloadURL ไม่ใช่ default image
         const defaultAvatar = "https://static.vecteezy.com/system/resources/previews/013/494/828/original/web-avatar-illustration-on-a-white-background-free-vector.jpg";
         if (downloadURL === defaultAvatar) {
           throw new Error('Upload service returned default avatar image');
         }
        
                 this.newAvatarImg = downloadURL;
         this.AvatarForm.get('newAvatarImg')?.setValue(downloadURL);
         console.log('ChAvatarimg: Form newAvatarImg value set to:', this.AvatarForm.get('newAvatarImg')?.value);
         console.log('ChAvatarimg: Component newAvatarImg set to:', this.newAvatarImg);
         console.log('ChAvatarimg: Form is now valid:', this.AvatarForm.valid);
         console.log('ChAvatarimg: Form errors after setting newAvatarImg:', this.AvatarForm.errors);
         console.log('ChAvatarimg: Form newAvatarImg control valid:', this.AvatarForm.get('newAvatarImg')?.valid);
         console.log('ChAvatarimg: Form newAvatarImg control errors:', this.AvatarForm.get('newAvatarImg')?.errors);
      })
                       .catch(error => {
          console.error('ChAvatarimg: uploadService.uploadFile promise rejected');
          console.error('ChAvatarimg: Error uploading file:', error);
           console.error('ChAvatarimg: Error message:', error.message);
           this.snackbarService.openSnackBar(`Error uploading image: ${error.message}`, 'error');
         });

    // Set selected image URL for preview
    console.log('ChAvatarimg: Setting up FileReader for preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        this.selectedImage = e.target.result;
        console.log('ChAvatarimg: Preview image set to:', this.selectedImage);
      } else {
        console.error('ChAvatarimg: FileReader result is null');
      }
    };
    reader.onerror = (e) => {
      console.error('ChAvatarimg: FileReader error:', e);
    };
    reader.readAsDataURL(file);
    console.log('ChAvatarimg: uploadFile method completed');
  }



}
