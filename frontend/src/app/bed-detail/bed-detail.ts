import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BedService, BedWithPlants, CompanionWarning } from '../bed.service';

@Component({
  selector: 'app-bed-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './bed-detail.html',
  styleUrl: './bed-detail.css',
})
export class BedDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private bedService = inject(BedService);
  private changeDetector = inject(ChangeDetectorRef);

  bed: BedWithPlants | null = null;
  private bedId = 0;

  // text shown if the bed itself fails to load (404, server down)
  loadError = '';
  // text shown when assigning a plant goes wrong, empty means no error
  errorMessage = '';

  availablePlants = [
    { id: 1, name: 'Tomate' },
    { id: 2, name: 'Moehre' },
    { id: 3, name: 'Zwiebel' },
    { id: 4, name: 'Salat' },
    { id: 5, name: 'Buschbohne' },
  ];

  assignPlantForm = new FormGroup({
    plant_id: new FormControl('', Validators.required),
    row_index: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit() {
    const idText = this.route.snapshot.paramMap.get('id');
    this.bedId = Number(idText);
    this.loadBed();
  }

  private loadBed() {
    this.bedService.getBed(this.bedId).subscribe({
      // the request succeeded
      next: (bed) => {
        this.bed = bed;
        this.loadError = '';
        this.changeDetector.detectChanges();
      },
      // the server refused it (e.g. 404), or is not reachable at all
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
