import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-showimg',
  standalone: true,
  imports: [CommonModule,
            MatToolbarModule],
  templateUrl: './showimg.component.html',
  styleUrl: './showimg.component.scss'
})
export class ShowimgComponent implements OnInit {

  imgAll: any = [];
  aid: any;
  name: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.aid = data.aid;
    this.name = data.name;
    console.log('ShowimgComponent: Received data:', data);
    console.log('ShowimgComponent: aid:', this.aid);
    console.log('ShowimgComponent: name:', this.name);
  }

  ngOnInit(): void {
    console.log('ShowimgComponent: Fetching images for aid:', this.aid);
    
    if (!this.aid) {
      console.error('ShowimgComponent: aid is undefined!');
      return;
    }

    fetch(`https://facemashbackend.onrender.com/img/fetchAllUserImg/${this.aid}`)
      .then((response: Response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: any) => {
        console.log('ShowimgComponent: API response:', data);
        console.log('ShowimgComponent: First item:', data[0]);
        this.imgAll = data[0];
        console.log('ShowimgComponent: Final imgAll:', this.imgAll);
      })
      .catch(error => {
        console.error('ShowimgComponent: There was a problem with the fetch operation:', error);
      });
  }

}
