import { Component, OnInit } from '@angular/core';
import { RouteService } from '../../services/route.service';
import { Route } from '../../models/route.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DestinationModalComponent } from '../modals/destination-modal/destination-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  routes: Route[] = [];
  loading = true;
  error: string | null = null;

  constructor(private routeService: RouteService, private dialog: MatDialog) { }

  async ngOnInit() {
    try {
      this.routes = await this.routeService.getRoutes();
      console.log('Routes loaded:', this.routes);
    } catch (err) {
      console.error('Error loading routes:', err);
      this.error = 'Failed to load routes. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  viewDetails(route: Route) {
    this.dialog.open(DestinationModalComponent, {
      data: route,
      width: '600px'
    });
  }
}