import { LatLngTuple } from "leaflet";

export interface Route {
    id?: string,
    originIata: string,
    originCity: string;
    destinationIata: string;
    destinationCity: string;
    plane: string;
    planeImage: string;
    economyPrice: number;
    businessPrice: number;
    firstPrice: number;
    turnarounds: number;
    flights: number;
    comments: string;

    originCoords?: LatLngTuple; // [lat, lng]
    destinationCoords?: LatLngTuple; // [lat, lng]
}