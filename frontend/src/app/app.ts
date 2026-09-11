import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  username(): string | null {
    const user = this.authService.getCurrentUser();
    return user ? user.username : null;
  }

  // send to /login after logout since the current page may be a protected one
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
