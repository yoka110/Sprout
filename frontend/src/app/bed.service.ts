// tools for creating a service and asking Angular for other services
import { Injectable, inject } from '@angular/core';
// service that sends HTTP requests to the backend
import { HttpClient } from '@angular/common/http';

// shape of one bed as it comes back from GET /api/beds
export interface Bed {
  id: number;
  user_id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
}

// data needed to create a new bed, sent to POST /api/beds
export interface NewBed {
  user_id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
}

// one plant placed in a bed, part of the detail view
export interface BedPlant {
  bed_plant_id: number;
  row_index: number;
  plant_id: number;
  name: string;
  spacing_cm: number;
  height_cm: number;
}

// one companion-planting warning, part of the detail view
export interface CompanionWarning {
  plant_a: string;
  plant_b: string;
  type: string;
  reason: string;
}

// a single bed together with its full occupancy and warnings
// (no user_id here: GET /api/beds/:id does not return it)
export interface BedWithPlants {
  id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
  plants: BedPlant[];
  warnings: CompanionWarning[];
}

// providedIn root means: one instance, available in every component
@Injectable({
  providedIn: 'root',
})
export class BedService {
  // ask Angular for the HttpClient
  private http = inject(HttpClient);
  // base address of the bed endpoints
  private apiUrl = 'http://localhost:3000/api/beds';

  // get all beds belonging to one user
  getBeds(userId: number) {
    return this.http.get<Bed[]>(this.apiUrl + '?userId=' + userId);
  }

  // get one bed with its plants and companion warnings
  getBed(id: number) {
    return this.http.get<BedWithPlants>(this.apiUrl + '/' + id);
  }

  // create a new bed
  createBed(bed: NewBed) {
    return this.http.post<Bed>(this.apiUrl, bed);
  }
}
