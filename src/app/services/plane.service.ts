import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs";

export interface Plane {
    brand: string;
    model: string;
    cat: number;
    pax: number;
    range: number;
    speed: number;
    consumption: number;
    price: number;
    img: string;
}

@Injectable({
    providedIn: "root"
})
export class PlaneService {
    constructor(private http: HttpClient) { }

    getPlanes(): Observable<{ planes: Plane[] }> {
        return this.http.get<{ planes: Plane[] }>('/assets/planes.json').pipe(
            catchError(err => {
                console.error('PlaneService: Error loading planes:', err);
                return of({ planes: [] });
            })
        );
    }
}