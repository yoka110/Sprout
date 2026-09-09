import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BedService, Bed } from '../bed.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-bed-list',
  imports: [RouterLink],
  templateUrl: './bed-list.html',
  styleUrl: './bed-list.css',
})
export class BedList implements OnInit {
  private bedService = inject(BedService);
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);

  beds: Bed[] = [];

  ngOnInit() {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.bedService.getBeds(user.id).subscribe((beds) => {
        this.beds = beds;
        this.changeDetector.detectChanges();
      });
    }
  }
}
