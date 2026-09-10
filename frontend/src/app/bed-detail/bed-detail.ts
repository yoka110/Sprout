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

  // the bed shown here, null until the first request comes back
  bed: BedWithPlants | null = null;
  // the :id from the route, read once and reused for assign/remove
  private bedId = 0;

  // text shown when assigning a plant goes wrong, empty means no error
  errorMessage = '';

  // temporary fixed list until plant.service (AP-B) exists (F-24 IDs 1-5)
  availablePlants = [
    { id: 1, name: 'Tomate' },
    { id: 2, name: 'Moehre' },
    { id: 3, name: 'Zwiebel' },
    { id: 4, name: 'Salat' },
    { id: 5, name: 'Buschbohne' },
  ];

  // the form for assigning a plant to a row
  assignPlantForm = new FormGroup({
    plant_id: new FormControl('', Validators.required),
    row_index: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit() {
    const idText = this.route.snapshot.paramMap.get('id');
    this.bedId = Number(idText);
    this.loadBed();
  }

  // (re)loads the bed; used on init and again after every assign/remove,
  // because assigning or removing a plant changes the warnings too
  private loadBed() {
    this.bedService.getBed(this.bedId).subscribe((bed) => {
      this.bed = bed;
      this.changeDetector.detectChanges();
    });
  }

  // runs when the user submits the assign-plant form
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
      // the backend accepted it: clear the form and reload to get fresh warnings
      next: () => {
        this.assignPlantForm.reset();
        this.errorMessage = '';
        this.loadBed();
      },
      // the backend refused it (e.g. row already occupied), or the server is not running
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

  // runs when the user clicks "Entfernen" next to a plant
  onRemovePlant(bedPlantId: number) {
    this.bedService.removePlant(this.bedId, bedPlantId).subscribe({
      next: () => this.loadBed(),
      error: () => {
        this.errorMessage = 'Entfernen fehlgeschlagen';
        this.changeDetector.detectChanges();
      },
    });
  }

  // how many plants of this kind roughly fit in one row (F-10)
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
