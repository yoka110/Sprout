import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BedService, BedDetail as BedData } from '../bed.service';

@Component({
  selector: 'app-bed-detail',
  imports: [],
  templateUrl: './bed-detail.html',
  styleUrl: './bed-detail.css',
})
export class BedDetail implements OnInit {
  // ask Angular for the services and tools this component needs
  private route = inject(ActivatedRoute);
  private bedService = inject(BedService);
  private changeDetector = inject(ChangeDetectorRef);

  // the bed shown here, null until the request comes back
  bed: BedData | null = null;

  ngOnInit() {
    // read the :id part of the current URL
    const idText = this.route.snapshot.paramMap.get('id');
    const id = Number(idText);

    this.bedService.getBed(id).subscribe((bed) => {
      this.bed = bed;
      this.changeDetector.detectChanges();
    });
  }
}
