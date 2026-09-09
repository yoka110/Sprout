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
  // ask Angular for the services and the change detector this component needs
  private bedService = inject(BedService);
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);

  // the beds shown in the list, empty until the request comes back
  beds: Bed[] = [];

  ngOnInit() {
    // find out who is logged in
    const user = this.authService.getCurrentUser();

    // only load beds if somebody is actually logged in
    if (user) {
      this.bedService.getBeds(user.id).subscribe((beds) => {
        this.beds = beds;
        // force Angular to redraw right now — the automatic trigger
        // was not reliable in our tests, even with zone.js and xhr active
        this.changeDetector.detectChanges();
      });
    }
  }
}
