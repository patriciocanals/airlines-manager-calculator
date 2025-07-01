import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Route } from '../../../models/route.model';
import { RouteService } from '../../../services/route.service';
import { GeoService } from '../../../services/geo.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-destination-modal',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatDialogModule],
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.scss']
})
export class DestinationModalComponent implements AfterViewInit {
  route: Route;
  showMap = false;

  constructor(
    public dialogRef: MatDialogRef<DestinationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Route,
    private routeService: RouteService,
    private geoService: GeoService
  ) {
    this.route = { ...data };
  }

  async ngAfterViewInit() {
    // Obtener coordenadas si no están presentes
    if (!this.route.originCoords) {
      this.route.originCoords = await firstValueFrom(
        this.geoService.getCoordinates(`${this.route.originIata} ${this.route.originCity}`)
      );
    }
    if (!this.route.destinationCoords) {
      this.route.destinationCoords = await firstValueFrom(
        this.geoService.getCoordinates(`${this.route.destinationIata} ${this.route.destinationCity}`)
      );
    }

    // Mostrar mapa solo si hay coordenadas
    if (this.route.originCoords && this.route.destinationCoords) {
      this.showMap = true;
      const map = L.map('map').setView(this.route.originCoords, 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      L.polyline([this.route.originCoords, this.route.destinationCoords], { color: 'blue' }).addTo(map);
      map.fitBounds([this.route.originCoords, this.route.destinationCoords]);
    } else {
      // Ocultar el contenedor del mapa
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.style.display = 'none';
      }
    }
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
}