import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlantService, PlantWithDetail } from '../plant.service';

@Component({
  selector: 'app-plant-detail',
  imports: [RouterLink],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.css',
})
export class PlantDetail implements OnInit {
  private plantService = inject(PlantService);
  private route = inject(ActivatedRoute);
  private changeDetector = inject(ChangeDetectorRef);

  plant: PlantWithDetail | null = null;
  errorMessage = '';
  isLoading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.plantService.getPlant(id).subscribe({
      next: (plant) => {
        this.plant = plant;
        this.isLoading = false;
        // F-29: no zone.js, so tell Angular to redraw after the async assignment
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Diese Pflanze wurde nicht gefunden';
        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    })
  }
}
