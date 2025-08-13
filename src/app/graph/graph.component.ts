import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { ImageService } from '../services/image.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    MatToolbarModule,
    RouterLink,
    HttpClientModule,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss'
})
export class GraphComponent implements OnInit {
  topTenImages: any[] = [];
  previousTopTenImages: any[] = [];
  avatar_img: any;
  name: any;
  email: any;
  aid: any;

  constructor(private imageService: ImageService, private authService: AuthService) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.getGraph();

      //getlocalStorage
      {
        this.aid = localStorage.getItem('aid');
        this.avatar_img = localStorage.getItem('avatar_img');
        this.name = localStorage.getItem('name');
        this.email = localStorage.getItem('email');
        console.log("LocalStorage data after update:", { aid: this.aid, avatar_img: this.avatar_img, name: this.name, email: this.email });
      }
    } else {
      console.warn('localStorage is not available. Skipping initialization.');
    }
  }

  getGraph(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.imageService.getAllImages().subscribe(
        (data: any) => {
          const sortedData = data.slice().sort((a: any, b: any) => b.points - a.points);

          // เก็บ top ten เดิมก่อน (ถ้ามี)
          this.previousTopTenImages = this.topTenImages || [];

          // ตัดเอาแค่ 10 อันดับแรก
          this.topTenImages = sortedData.slice(0, 10);

          // กรองเอาข้อมูลเจ้าของภาพมาเติมในแต่ละ item




        },
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  createChart(): void {
    const labels = this.topTenImages.map(image => {
      return image.name.toString() + "(image_id: " + image._id.toString() + ")";
    });

    const data = this.topTenImages.map(image => image.points);

    const canvas: HTMLCanvasElement = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Points',
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          // tension: 0.1
        }]
      }
    });
  }
}
