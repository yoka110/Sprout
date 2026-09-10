import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BedService, Bed } from '../bed.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-bed-list',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './bed-list.html',
  styleUrl: './bed-list.css',
})
export class BedList implements OnInit {
  private bedService = inject(BedService);
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);

  beds: Bed[] = [];

  // text shown when creating a bed goes wrong, empty means no error
  errorMessage = '';

  // the form for creating a new bed
  createBedForm = new FormGroup({
    name: new FormControl('', Validators.required),
    rows: new FormControl('', [Validators.required, Validators.min(1), Validators.max(6)]),
    row_length_cm: new FormControl('', [Validators.required, Validators.min(1)]),
    location: new FormControl('', Validators.required),
  });

  ngOnInit() {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.bedService.getBeds(user.id).subscribe((beds) => {
        this.beds = beds;
        this.changeDetector.detectChanges();
      });
    }
  }

  // runs when the user submits the create-bed form
  onSubmit() {
    if (this.createBedForm.invalid) {
      this.errorMessage = 'Bitte alle Felder korrekt ausfüllen (Reihen: 1 bis 6)';
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const newBed = {
      user_id: user.id,
      name: this.createBedForm.value.name!,
      rows: Number(this.createBedForm.value.rows),
      row_length_cm: Number(this.createBedForm.value.row_length_cm),
      location: this.createBedForm.value.location!,
    };

    this.bedService.createBed(newBed).subscribe({
      // the backend accepted and created the bed
      next: (bed) => {
        this.beds.push(bed);
        this.createBedForm.reset();
        this.errorMessage = '';
        this.changeDetector.detectChanges();
      },
      // the backend refused it (e.g. rows outside 1-6), or the server is not running
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
}
