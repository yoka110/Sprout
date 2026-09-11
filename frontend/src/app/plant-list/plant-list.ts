import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plant, PlantService } from '../plant.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-plant-list',
  imports: [RouterLink],
  templateUrl: './plant-list.html',
  styleUrl: './plant-list.css',
})
export class PlantList implements OnInit {
  private plantService = inject(PlantService);
  private authService = inject(AuthService)
  private changeDetector = inject(ChangeDetectorRef);

  plants: Plant[] = [];
  errorMessage = '';
  isLoading = true;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.plantService.getPlants(currentUser?.id).subscribe({
      next: (plants) => {
        this.plants = plants;
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Die Pflanzen konnten nicht geladen werden.'
        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }
}
