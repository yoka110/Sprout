import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plant, PlantService } from '../plant.service';

@Component({
  selector: 'app-plant-list',
  imports: [RouterLink],
  templateUrl: './plant-list.html',
  styleUrl: './plant-list.css',
})
export class PlantList implements OnInit {
  private plantService = inject(PlantService);
  private changeDetector = inject(ChangeDetectorRef);

  plants: Plant[] = [];
  errorMessage = '';
  isLoading = true;

  ngOnInit(): void {
    this.plantService.getPlants().subscribe({
      next: (plants) => {
        this.plants = plants;
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Die Pflanzen konnten nicht gelanden werden.'
        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }
}
