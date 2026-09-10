import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Plant {
    id: number;
    name: string;
    family: string;
    difficulty: string;
    location: string;
    spacing_cm: number;
    height_cm: number;
    owner_id: number | null;
}

export interface GrowthStage {
  id: number;
  plant_id: number;
  position: number;
  title: string;
  period: string;
  instruction: string;
}

export interface PlantProblem {
  id: number;
  plant_id: number;
  name: string;
  countermeasure: string;
}

export interface PlantWithDetail extends Plant {
    stages: GrowthStage[];
    problems: PlantProblem[];
}

@Injectable({
    providedIn: 'root'
})

export class PlantService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/plants';

    getPlants(userId?: number) {
        if (userId) {
            return this.http.get<Plant[]>(`${this.apiUrl}?uswerId=${userId}`);
        }
        return this.http.get<Plant[]>(this.apiUrl);
    }

    getPlant(id: number) {
        return this.http.get<PlantWithDetail>(`${this.apiUrl}/${id}`)
    }
}
