import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Bed {
  id: number;
  user_id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
  notes: string;
}

export interface NewBed {
  user_id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
  notes: string;
}

export interface BedPlant {
  bed_plant_id: number;
  row_index: number;
  plant_id: number;
  name: string;
  spacing_cm: number;
  height_cm: number;
}

export interface NewBedPlant {
  plant_id: number;
  row_index: number;
}

export interface CompanionWarning {
  plant_a: string;
  plant_b: string;
  type: string;
  reason: string;
}

// no user_id here on purpose: GET /api/beds/:id does not return it
export interface BedWithPlants {
  id: number;
  name: string;
  rows: number;
  row_length_cm: number;
  location: string;
  notes: string;
  plants: BedPlant[];
  warnings: CompanionWarning[];
}

@Injectable({
  providedIn: 'root',
})
export class BedService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/beds';

  getBeds(userId: number) {
    return this.http.get<Bed[]>(this.apiUrl + '?userId=' + userId);
  }

  getBed(id: number) {
    return this.http.get<BedWithPlants>(this.apiUrl + '/' + id);
  }

  createBed(bed: NewBed) {
    return this.http.post<Bed>(this.apiUrl, bed);
  }

  deleteBed(id: number) {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }

  updateNotes(id: number, notes: string) {
    return this.http.put<{ notes: string }>(this.apiUrl + '/' + id + '/notes', { notes });
  }

  assignPlant(bedId: number, plant: NewBedPlant) {
    return this.http.post<{ bed_plant_id: number }>(this.apiUrl + '/' + bedId + '/plants', plant);
  }

  removePlant(bedId: number, bedPlantId: number) {
    return this.http.delete<void>(this.apiUrl + '/' + bedId + '/plants/' + bedPlantId);
  }
}
