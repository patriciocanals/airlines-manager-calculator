import { Component, OnInit } from '@angular/core';
import { PlaneService, Plane } from '../../services/plane.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatCardModule, MatListModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  planes: Plane[] = [];

  constructor(private planeService: PlaneService) { }

  async ngOnInit() {
    const data = await this.planeService.getPlanes().toPromise();
    this.planes = data!.planes;
  }
}