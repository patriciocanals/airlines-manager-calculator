import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Route } from '../../../models/route.model';
import { RouteService } from '../../../services/route.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import * as L from 'leaflet';


@Component({
  selector: 'app-destination-modal',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatDialogModule],
  templateUrl: './destination-modal.component.html',
  styleUrl: './destination-modal.component.scss'
})
export class DestinationModalComponent implements AfterViewInit {
  route: Route = {
    id: undefined,
    originIata: '',
    originCity: '',
    destinationIata: '',
    destinationCity: '',
    plane: '',
    planeImage: '',
    economyPrice: 0,
    businessPrice: 0,
    firstPrice: 0,
    turnarounds: 0,
    flights: 0,
    comments: '',
  };

  constructor(
    public dialogRef: MatDialogRef<DestinationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Route,
    private routeService: RouteService
  ) {
    this.route = { ...data };
  }

  async save() {
    await this.routeService.updateRoute(this.route.id!, this.route);
    this.dialogRef.close();
  }

  async delete() {
    if (confirm('Are you sure you want to delete this route?')) {
      await this.routeService.deleteRoute(this.route.id!);
      this.dialogRef.close();
    }
  }

  ngAfterViewInit() {
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const origin: L.LatLngExpression = [51.505, -0.09]; //ejemplo
    const destination: L.LatLngExpression = [48.8566, 2.3522]; //ejemplo

    L.polyline([origin, destination], { color: 'blue' }).addTo(map);
    map.fitBounds([origin, destination]);
  }

}