import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Bitte Benutzername und Passwort ausfüllen';
      return;
    }

    const username = this.loginForm.value.username!;
    const password = this.loginForm.value.password!;

    this.authService.login(username, password).subscribe({
      next: (user) => {
        this.authService.saveUser(user);
        this.router.navigate(['/beds']);
      },
      error: (response) => {
        // response.error is the server body { error: "..." }; fall back if the server is unreachable
        if (response.error && response.error.error) {
          this.errorMessage = response.error.error;
        } else {
          this.errorMessage = 'Server nicht erreichbar';
        }
      },
    });
  }
}
