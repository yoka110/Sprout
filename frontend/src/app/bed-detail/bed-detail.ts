import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BedService, BedWithPlants, CompanionWarning } from '../bed.service';
import { PlantService, Plant } from '../plant.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-bed-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './bed-detail.html',
  styleUrl: './bed-detail.css',
})
export class BedDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private bedService = inject(BedService);
  private plantService = inject(PlantService);
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);

  bed: BedWithPlants | null = null;
  private bedId = 0;

  loadError = '';
  errorMessage = '';

  availablePlants: Plant[] = [];

  assignPlantForm = new FormGroup({
    plant_id: new FormControl('', Validators.required),
    row_index: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit() {
    const idText = this.route.snapshot.paramMap.get('id');
    this.bedId = Number(idText);
    this.loadBed();
    this.loadPlants();
  }

  private loadBed() {
    this.bedService.getBed(this.bedId).subscribe({
      next: (bed) => {
        this.bed = bed;
        this.loadError = '';
        // F-29: no zone.js, so tell Angular to redraw after the async assignment
        this.changeDetector.detectChanges();
      },
      error: (response) => {
        if (response.error && response.error.error) {
          this.loadError = response.error.error;
        } else {
          this.loadError = 'Server nicht erreichbar';
        }
        this.changeDetector.detectChanges();
      },
    });
  }

  private loadPlants() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : undefined;

    this.plantService.getPlants(userId).subscribe((plants) => {
      this.availablePlants = plants;
      this.changeDetector.detectChanges();
    });
  }

  onAssignPlant() {
    if (this.assignPlantForm.invalid) {
      this.errorMessage = 'Bitte Pflanze und Reihe auswählen';
      return;
    }

    const newBedPlant = {
      plant_id: Number(this.assignPlantForm.value.plant_id),
      row_index: Number(this.assignPlantForm.value.row_index),
    };

    this.bedService.assignPlant(this.bedId, newBedPlant).subscribe({
      next: () => {
        this.assignPlantForm.reset();
        this.errorMessage = '';
        this.loadBed();
      },
      error: (response) => {
        if (response.error && response.error.error) {
          this.errorMessage = response.error.error;
        } else {
          this.errorMessage = 'Server nicht erreichbar';
        }
        this.changeDetector.detectChanges();
      },
    });
  }

  onRemovePlant(bedPlantId: number) {
    this.bedService.removePlant(this.bedId, bedPlantId).subscribe({
      next: () => this.loadBed(),
      error: () => {
        this.errorMessage = 'Entfernen fehlgeschlagen';
        this.changeDetector.detectChanges();
      },
    });
  }

  plantCount(rowLengthCm: number, spacingCm: number): number {
    return Math.floor(rowLengthCm / spacingCm);
  }

  get badWarnings(): CompanionWarning[] {
    return this.bed?.warnings.filter((w) => w.type === 'bad') ?? [];
  }

  get goodWarnings(): CompanionWarning[] {
    return this.bed?.warnings.filter((w) => w.type === 'good') ?? [];
  }
}
