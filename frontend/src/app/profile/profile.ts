import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { PlantService } from '../plant.service';
import { BedService } from '../bed.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private plantService = inject(PlantService);
  private bedService = inject(BedService);
  private changeDetector = inject(ChangeDetectorRef);

  username = '';
  ownPlantCount = 0;
  ownBedCount = 0;

  isLoading = true;
  errorMessage = '';

  // counts down from 2 (plants request + beds request); 0 means both are done
  private openRequests = 2;

  ngOnInit() {
    const user = this.authService.getCurrentUser();

    // route is guarded, so this should not happen; keeps TypeScript happy below
    if (!user) {
      this.errorMessage = 'Nicht angemeldet';
      this.isLoading = false;
      this.changeDetector.detectChanges();
      return;
    }

    this.username = user.username;

    this.plantService.getPlants(user.id).subscribe({
      next: (plants) => {
        // getPlants(userId) returns guides (owner_id null) plus this user's
        // own plants; owner_id === user.id picks out the own ones
        this.ownPlantCount = plants.filter((p) => p.owner_id === user.id).length;
        this.requestFinished();
      },
      error: () => {
        this.errorMessage = 'Server nicht erreichbar';
        this.requestFinished();
      },
    });

    this.bedService.getBeds(user.id).subscribe({
      next: (beds) => {
        this.ownBedCount = beds.length;
        this.requestFinished();
      },
      error: () => {
        this.errorMessage = 'Server nicht erreichbar';
        this.requestFinished();
      },
    });
  }

  private requestFinished() {
    this.openRequests--;
    if (this.openRequests === 0) {
      this.isLoading = false;
    }
    // F-29: no zone.js, so tell Angular to redraw after the async assignment
    this.changeDetector.detectChanges();
  }
}
