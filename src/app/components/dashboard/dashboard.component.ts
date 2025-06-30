import { Component, OnInit } from '@angular/core';
import { RouteService } from '../../services/route.service';
import { Route } from '../../models/route.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  routes: Route[] = [];

  constructor(private routeService: RouteService) {}

  async ngOnInit() {
      this.routes = await this.routeService.getRoutes();
  }

  viewDetails(routes: Route) {}
}
