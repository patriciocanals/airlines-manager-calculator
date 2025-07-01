import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LatLngTuple } from 'leaflet';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  private apiKey = environment.geoapifyApiKey;

  constructor(private http: HttpClient) {}

  getCoordinates(query: string): Observable<LatLngTuple | undefined> {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.features && response.features.length > 0) {
          const { lat, lon } = response.features[0].properties;
          return [lat, lon] as LatLngTuple;
        }
        return undefined;
      }),
      catchError(() => of(undefined))
    );
  }
}