import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaneService, Plane } from '../../services/plane.service';
import { RouteService } from '../../services/route.service';
import { Route } from '../../models/route.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { DestinationModalComponent } from '../modals/destination-modal/destination-modal.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements AfterViewInit {
  originIata = '';
  originCity = '';
  destinationIata = '';
  destinationCity = '';
  airportCategory: number = 1;
  distance: string = ''; // Changed to string for empty input
  economyDemand: string = ''; // Changed to string for empty input
  businessDemand: string = ''; // Changed to string for empty input
  firstDemand: string = ''; // Changed to string for empty input
  cargoDemand: string = ''; // Changed to string for empty input
  turnaroundTime: number = 0;
  planeCount: string = ''; // Changed to string for empty input
  suggestedPlanes: Plane[] = [];
  filteredPlanes: Plane[] = [];
  error: string | null = null;
  airportCategories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  turnaroundOptions = Array.from({ length: 48 }, (_, i) => (i + 1) * 15);
  filterBy: string = 'all';
  filterValue: string = '';
  sortBy: string = 'pax';
  seatOffers = { economy: 0, business: 0, first: 0, cargo: 0 };

  constructor(
    private planeService: PlaneService,
    private routeService: RouteService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  onSelectClick(field: string) {
    console.log(`Calculator: ${field} select clicked`);
    this.cdr.detectChanges();
  }

  onSelectChange(field: string, value: any) {
    console.log(`Calculator: ${field} selected value:`, value);
    this.cdr.detectChanges();
  }

  applyFilterAndSort() {
    let result = [...this.suggestedPlanes];

    if (this.filterBy !== 'all' && this.filterValue) {
      result = result.filter(plane => {
        if (this.filterBy === 'brand') {
          return plane.brand.toLowerCase().includes(this.filterValue.toLowerCase());
        } else if (this.filterBy === 'category') {
          return plane.cat === parseInt(this.filterValue);
        }
        return true;
      });
    }

    result.sort((a, b) => {
      if (this.sortBy === 'pax') return a.pax - b.pax;
      if (this.sortBy === 'range') return a.range - b.range;
      if (this.sortBy === 'price') return a.price - b.price;
      return 0;
    });

    this.filteredPlanes = result;
  }

  async calculate() {
    this.error = null;
    this.suggestedPlanes = [];
    this.filteredPlanes = [];
    this.seatOffers = { economy: 0, business: 0, first: 0, cargo: 0 };

    console.log('Calculator: Inputs', {
      originIata: this.originIata,
      originCity: this.originCity,
      destinationIata: this.destinationIata,
      destinationCity: this.destinationCity,
      airportCategory: this.airportCategory,
      distance: this.distance,
      economyDemand: this.economyDemand,
      businessDemand: this.businessDemand,
      firstDemand: this.firstDemand,
      cargoDemand: this.cargoDemand,
      turnaroundTime: this.turnaroundTime,
      planeCount: this.planeCount
    });

    if (!this.originIata || !this.originCity || !this.destinationIata || !this.destinationCity) {
      this.error = 'Please fill in all airport and city fields.';
      return;
    }
    if (this.airportCategory < 1 || this.airportCategory > 10) {
      this.error = 'Please select a valid airport category (1-10).';
      return;
    }

    // Convert string inputs to numbers, default to NaN if empty
    const distanceNum = parseFloat(this.distance);
    const economyDemandNum = parseFloat(this.economyDemand);
    const businessDemandNum = parseFloat(this.businessDemand);
    const firstDemandNum = parseFloat(this.firstDemand);
    const cargoDemandNum = parseFloat(this.cargoDemand);
    const planeCountNum = parseFloat(this.planeCount);

    if (isNaN(distanceNum) || distanceNum <= 0) {
      this.error = 'Please enter a valid distance greater than 0.';
      return;
    }
    if (isNaN(economyDemandNum) || economyDemandNum < 0) {
      this.error = 'Please enter a valid economy demand.';
      return;
    }
    if (isNaN(businessDemandNum) || businessDemandNum < 0) {
      this.error = 'Please enter a valid business demand.';
      return;
    }
    if (isNaN(firstDemandNum) || firstDemandNum < 0) {
      this.error = 'Please enter a valid first class demand.';
      return;
    }
    if (isNaN(cargoDemandNum) || cargoDemandNum < 0) {
      this.error = 'Please enter a valid cargo demand.';
      return;
    }
    if (isNaN(planeCountNum) || planeCountNum < 1) {
      this.error = 'Please enter a valid number of planes.';
      return;
    }
    if (this.turnaroundTime <= 0) {
      this.error = 'Please select a valid turnaround time greater than 0.';
      return;
    }

    try {
      const turnaroundMinutes = this.turnaroundTime;
      const dailyTurnarounds = Math.floor((24 * 60) / turnaroundMinutes);
      const dailyFlights = dailyTurnarounds * 2 * planeCountNum;

      this.seatOffers = {
        economy: Math.ceil(economyDemandNum / dailyFlights),
        business: Math.ceil(businessDemandNum / dailyFlights),
        first: Math.ceil(firstDemandNum / dailyFlights),
        cargo: Math.ceil(cargoDemandNum / dailyFlights)
      };

      const totalSeats = this.seatOffers.economy + this.seatOffers.business * 2 + this.seatOffers.first * 4;

      const planes = await this.planeService.getPlanes().toPromise();
      if (!planes) {
        this.error = 'Failed to load planes data.';
        return;
      }
      this.suggestedPlanes = planes.planes.filter(
        plane => plane.pax >= totalSeats && plane.cat <= this.airportCategory && plane.range >= distanceNum
      );
      this.applyFilterAndSort();

      console.log('Calculator: Suggested planes:', this.suggestedPlanes);
      console.log('Calculator: Seat offers:', this.seatOffers);

      if (this.suggestedPlanes.length === 0) {
        this.error = 'No planes match the criteria. Try adjusting your inputs.';
      }
    } catch (err) {
      console.error('Calculator: Error calculating:', err);
      this.error = 'Failed to calculate. Please check your inputs and try again.';
    }
  }

  addRoute(plane: Plane) {
    if (!this.originIata || !this.originCity || !this.destinationIata || !this.destinationCity) {
      this.error = 'Please fill in all airport and city fields before adding a route.';
      return;
    }

    const economyDemandNum = parseFloat(this.economyDemand) || 0;
    const businessDemandNum = parseFloat(this.businessDemand) || 0;
    const firstDemandNum = parseFloat(this.firstDemand) || 0;

    const route: Route = {
      originIata: this.originIata,
      originCity: this.originCity,
      destinationIata: this.destinationIata,
      destinationCity: this.destinationCity,
      plane: `${plane.brand} ${plane.model}`,
      planeImage: plane.img ? `assets/planes/${plane.img}` : 'assets/placeholder.jpg',
      economyPrice: economyDemandNum * 10,
      businessPrice: businessDemandNum * 20,
      firstPrice: firstDemandNum * 40,
      turnarounds: Math.floor((24 * 60) / this.turnaroundTime),
      flights: 0,
      comments: ''
    };

    this.dialog.open(DestinationModalComponent, {
      data: route,
      width: '600px'
    }).afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.routeService.addRoute(result);
          console.log('Calculator: Route added:', result);
          this.resetForm();
        } catch (err) {
          console.error('Calculator: Error adding route:', err);
          this.error = 'Failed to add route. Please try again.';
        }
      }
    });
  }

  resetForm() {
    this.originIata = '';
    this.originCity = '';
    this.destinationIata = '';
    this.destinationCity = '';
    this.airportCategory = 1;
    this.distance = '';
    this.economyDemand = '';
    this.businessDemand = '';
    this.firstDemand = '';
    this.cargoDemand = '';
    this.turnaroundTime = 120;
    this.planeCount = '';
    this.suggestedPlanes = [];
    this.filteredPlanes = [];
    this.error = null;
    this.filterBy = 'all';
    this.filterValue = '';
    this.sortBy = 'pax';
    this.seatOffers = { economy: 0, business: 0, first: 0, cargo: 0 };
    this.cdr.detectChanges();
  }
}