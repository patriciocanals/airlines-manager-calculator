import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Route } from '../../../models/route.model';
import { RouteService } from '../../../services/route.service';
import { PlaneService, Plane } from '../../../services/plane.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LatLngTuple } from 'leaflet';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-destination-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    HttpClientModule
  ],
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.scss']
})
export class DestinationModalComponent implements AfterViewInit {
  routeForm: FormGroup;
  map: L.Map | null = null;
  @ViewChild('map') mapContainer!: ElementRef;
  error: string | null = null;
  planes: Plane[] = [];
  planeSelections: string[] = [];
  isSaving = false; // Prevent duplicate saves

  constructor(
    public dialogRef: MatDialogRef<DestinationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Route,
    private fb: FormBuilder,
    private routeService: RouteService,
    private planeService: PlaneService,
    private http: HttpClient
  ) {
    this.planeSelections = this.data.plane || new Array(this.data.planeCount || 1).fill('');
    this.routeForm = this.fb.group({
      originIata: [this.data.originIata, [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      originCity: [this.data.originCity, Validators.required],
      destinationIata: [this.data.destinationIata, [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      destinationCity: [this.data.destinationCity, Validators.required],
      plane: [this.planeSelections, Validators.required],
      economyPrice: [this.data.economyPrice, [Validators.required, Validators.min(0)]],
      businessPrice: [this.data.businessPrice, [Validators.required, Validators.min(0)]],
      firstPrice: [this.data.firstPrice, [Validators.required, Validators.min(0)]],
      turnarounds: [{ value: this.data.turnarounds, disabled: true }, [Validators.required, Validators.min(1)]],
      flights: [{ value: this.data.flights, disabled: true }, [Validators.required, Validators.min(0)]],
      comments: [this.data.comments || '']
    });

    this.planeService.getPlanes().subscribe({
      next: (planesData) => {
        this.planes = planesData.planes;
      },
      error: (err) => {
        console.error('Error fetching planes:', err);
        this.error = 'Failed to load planes.';
      }
    });
  }

  async ngAfterViewInit() {
    if (this.mapContainer?.nativeElement) {
      try {
        // Fetch coordinates using Nominatim API
        const originCoords = await this.getCityCoordinates(this.data.originCity, this.data.originIata);
        const destinationCoords = await this.getCityCoordinates(this.data.destinationCity, this.data.destinationIata);

        this.map = L.map(this.mapContainer.nativeElement).setView(originCoords, 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(this.map!);

        L.marker(originCoords).addTo(this.map!).bindPopup(this.data.originCity).openPopup();
        L.marker(destinationCoords).addTo(this.map!).bindPopup(this.data.destinationCity);
        L.polyline([originCoords, destinationCoords], { color: 'blue' }).addTo(this.map!);
        this.map!.fitBounds([originCoords, destinationCoords]);
      } catch (err) {
        console.error('Error initializing map:', err);
        this.error = 'Failed to load map. Using default location.';
        this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(this.map!);
      }
    } else {
      console.error('Map container not found');
      this.error = 'Map container not found.';
    }
  }

  async getCityCoordinates(city: string, iata: string): Promise<LatLngTuple> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: `${city}, airport ${iata}`,
            format: 'json',
            limit: '1'
          }
        })
      );
      if (response.length > 0) {
        return [parseFloat(response[0].lat), parseFloat(response[0].lon)];
      }
      throw new Error('No coordinates found');
    } catch (err) {
      console.error(`Failed to fetch coordinates for ${city} (${iata}):`, err);
      return [0, 0]; // Fallback
    }
  }

  async saveRoute() {
    if (this.routeForm.invalid || this.isSaving) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true; // Prevent duplicate submissions
    const updatedRoute: Route = {
      ...this.data,
      ...this.routeForm.getRawValue(),
      plane: this.routeForm.get('plane')?.value || this.data.plane
    };

    try {
      await this.routeService.addRoute(updatedRoute);
      console.log('Route saved:', updatedRoute);
      this.dialogRef.close(updatedRoute);
    } catch (err) {
      console.error('Error saving route:', err);
      this.error = 'Failed to save route. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  updatePlaneSelection(index: number, value: string) {
    this.planeSelections[index] = value;
    this.routeForm.get('plane')?.setValue([...this.planeSelections]);
  }

  closeModal() {
    this.dialogRef.close();
  }
}