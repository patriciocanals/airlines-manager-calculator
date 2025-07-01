import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouteService } from '../../services/route.service';
import { GeoService } from '../../services/geo.service';
import { Route } from '../../models/route.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DestinationModalComponent } from '../modals/destination-modal/destination-modal.component';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatListModule, MatButtonModule, MatDialogModule],
  templateUrl: './destinations.component.html',
  styleUrls: ['./destinations.component.scss']
})
export class DestinationsComponent implements OnInit, AfterViewInit {
  routes: Route[] = [];
  filteredRoutes: Route[] = [];
  showMap = false;
  private map?: L.Map;

  constructor(
    private routeService: RouteService,
    private geoService: GeoService,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.routes = await this.routeService.getRoutes();
    this.filteredRoutes = [...this.routes];

    // Obtener coordenadas para cada ruta
    for (const route of this.routes) { // Fixed: Iterate over 'routes'
      route.originCoords = await firstValueFrom(
        this.geoService.getCoordinates(`${route.originIata} ${route.originCity}`)
      );
      route.destinationCoords = await firstValueFrom(
        this.geoService.getCoordinates(`${route.destinationIata} ${route.destinationCity}`)
      );
    }
    // Determinar si hay rutas con coordenadas para mostrar el mapa
    this.showMap = this.routes.some(route => route.originCoords && route.destinationCoords);
  }

  ngAfterViewInit() {
    if (this.showMap) {
      this.initMap();
      this.updateMap();
    }
  }

  private initMap() {
    this.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateMap() {
    if (!this.map) return;

    const bounds: L.LatLngTuple[] = [];
    this.filteredRoutes.forEach(route => {
      if (route.originCoords && route.destinationCoords) {
        L.polyline([route.originCoords, route.destinationCoords], { color: 'blue' }).addTo(this.map!);
        bounds.push(route.originCoords, route.destinationCoords);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds);
    } else {
      // Ocultar el mapa si no hay coordenadas
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.style.display = 'none';
      }
    }
  }

  filterRoutes(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRoutes = this.routes.filter(
      route =>
        route.originCity.toLowerCase().includes(filterValue) ||
        route.destinationCity.toLowerCase().includes(filterValue) ||
        route.originIata.toLowerCase().includes(filterValue) ||
        route.destinationIata.toLowerCase().includes(filterValue)
    );
    this.showMap = this.filteredRoutes.some(route => route.originCoords && route.destinationCoords);
    if (this.map) {
      this.updateMap();
    }
  }

  sortRoutes(order: 'asc' | 'desc') {
    this.filteredRoutes.sort((a, b) => {
      const comparison = a.destinationCity.localeCompare(b.destinationCity);
      return order === 'asc' ? comparison : -comparison;
    });
    if (this.map) {
      this.updateMap();
    }
  }

  openDetails(route: Route) {
    this.dialog.open(DestinationModalComponent, {
      data: route,
      width: '600px'
    });
  }
}