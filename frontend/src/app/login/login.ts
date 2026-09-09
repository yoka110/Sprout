// Component builds the component, inject asks Angular for services
import { Component, inject } from '@angular/core';
// building blocks for reactive forms
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Router changes the page from code, RouterLink is used in the template
import { Router, RouterLink } from '@angular/router';
// our own service that talks to the backend
import { AuthService } from '../auth.service';

@Component({
  // name of the tag this component would be used as
  selector: 'app-login',
  // everything the template needs: form directives and routerLink
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // ask Angular for the services we need
  private authService = inject(AuthService);
  private router = inject(Router);

  // text shown to the user when something goes wrong, empty means no error
  errorMessage = '';

  // the form: two fields, both required
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  // runs when the user submits the form
  onSubmit() {
    // stop here if a field is empty
    if (this.loginForm.invalid) {
      this.errorMessage = 'Bitte Benutzername und Passwort ausfüllen';
      return;
    }

    // read the typed values, the ! says they are filled because we checked above
    const username = this.loginForm.value.username!;
    const password = this.loginForm.value.password!;

    // send them to the backend, the request only starts because of subscribe
    this.authService.login(username, password).subscribe({
      // the backend accepted the login
      next: (user) => {
        // remember the user in the browser
        this.authService.saveUser(user);
        // go to the beds page
        this.router.navigate(['/beds']);
      },
      // the backend refused the login, or the server is not running
      error: (response) => {
        // response.error is the body sent by the server, which is { error: "..." }
        if (response.error && response.error.error) {
          this.errorMessage = response.error.error;
        } else {
          this.errorMessage = 'Server nicht erreichbar';
        }
      },
    });
  }
}
