import { Component } from '@angular/core';
import { PlaneService, Plane } from '../../services/plane.service';
import { RouteService } from '../../services/route.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-calculator',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent {
  originIata = '';
  originCity = '';
  destinationIata = '';
  destinationCity = '';
  airportCategory = 1;
  distance = 0;
  economyDemand = 0;
  businessDemand = 0;
  firstDemand = 0;
  cargoDemand = 0;
  turnaroundTime = '02:00';
  planeCount = 1;
  suggestedPlanes: Plane[] = [];

  constructor(private planeService: PlaneService, private routeService: RouteService) { }

  async calculate() {
    const [hours, minutes] = this.turnaroundTime.split(':').map(Number);
    const turnaroundMinutes = hours * 60 + minutes;
    const dailyTurnarounds = Math.floor((24 * 60) / turnaroundMinutes);
    const dailyFlights = dailyTurnarounds * 2 * this.planeCount;

    const economyOffer = Math.ceil(this.economyDemand / dailyFlights);
    const businessOffer = Math.ceil(this.businessDemand / dailyFlights);
    const firstOffer = Math.ceil(this.firstDemand / dailyFlights);
    const cargoOffer = Math.ceil(this.cargoDemand / dailyFlights);

    const totalSeats = economyOffer + businessOffer * 2 + firstOffer * 4;

    const planes = await this.planeService.getPlanes().toPromise();
    this.suggestedPlanes = planes!.planes.filter(plane =>
      plane.pax >= totalSeats &&
      plane.cat <= this.airportCategory &&
      plane.range >= this.distance
    ).sort((a, b) => b.pax - a.pax);
  }

  addRoute(plane: Plane) {
    // Abrir modal para crear ruta (implementado más adelante)
  }
}
