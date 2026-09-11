import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NewPlant, PlantService } from '../plant.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-plant-form',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './plant-form.html',
  styleUrl: './plant-form.css',
})
export class PlantForm {
  private plantService = inject(PlantService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);

  errorMessage = '';
  isSaving = false;
  // F-31 caps a plant at five growth stages
  readonly maxStages = 5;
  readonly maxProblems = 10;

  plantForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    family: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    difficulty: new FormControl('Einfach', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    location: new FormControl('Sonne', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    spacing_cm: new FormControl(30, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)]
    }),
    height_cm: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)]
    }),
    stages: new FormArray([this.createStage()]),
    problems: new FormArray<ReturnType<typeof this.createProblem>>([])
  })
  
  get stages() {
    return this.plantForm.controls.stages;
  }

  get problems() {
    return this.plantForm.controls.problems;
  }

  private createStage() {
    return new FormGroup({
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      period: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      instruction: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    });
  }

  private createProblem() {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      countermeasure: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    });
  }

  addStage() {
    if (this.stages.length < this.maxStages) {
      this.stages.push(this.createStage());
    }
  }

  removeStage(index: number) {
    if (this.stages.length > 1) {
      this.stages.removeAt(index);
    }
  }

  addProblem() {
    if (this.problems.length < this.maxProblems) {
      this.problems.push(this.createProblem());
    }
  }

  removeProblem(index: number) {
    this.problems.removeAt(index);
  }

  save() {
    if (this.plantForm.invalid) {
      return
    }

    const currentUser = this.authService.getCurrentUser();

    if (currentUser === null) {
      this.errorMessage = 'Bitte zuerst anmelden';
      return;
    }

    const newPlant: NewPlant = {
      name: this.plantForm.controls.name.value,
      family: this.plantForm.controls.family.value,
      difficulty: this.plantForm.controls.difficulty.value,
      location: this.plantForm.controls.location.value,
      spacing_cm: this.plantForm.controls.spacing_cm.value,
      height_cm: this.plantForm.controls.height_cm.value,
      stages: this.stages.getRawValue(),
      problems: this.problems.getRawValue(),
      owner_id: currentUser.id
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.plantService.createPlant(newPlant).subscribe({
      next: () => {
        this.router.navigate(['/plants']);
      },
      error: (err) => {
        if(err.status === 409) {
          this.errorMessage = "Eine Pflanze mit diesem Namen existiert bereits."
        } else {
          this.errorMessage = 'Die Pflanze konnte nicht gespeichert werden.';
        }
        this.isSaving = false;
        // F-29: no zone.js, so tell Angular to redraw after the async assignment
        this.changeDetector.detectChanges();
      }
    })
  }
}
