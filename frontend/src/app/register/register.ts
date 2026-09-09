// Component builds the component, inject asks Angular for services
import { Component, inject } from '@angular/core';
// building blocks for reactive forms, AbstractControl is used by our own check
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// Router changes the page from code, RouterLink is used in the template
import { Router, RouterLink } from '@angular/router';
// our own service that talks to the backend
import { AuthService } from '../auth.service';

// checks two fields at once: password and its repetition must be equal
// returns an error object when they differ, null when everything is fine
export function passwordsMatch(group: AbstractControl) {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordsDoNotMatch: true };
  }

  return null;
}

@Component({
  // name of the tag this component would be used as
  selector: 'app-register',
  // everything the template needs: form directives and routerLink
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  // ask Angular for the services we need
  private authService = inject(AuthService);
  private router = inject(Router);

  // text shown to the user when something goes wrong, empty means no error
  errorMessage = '';

  // the form: three fields, plus one check that looks at two of them together
  registerForm = new FormGroup(
    {
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatch },
  );

  // runs when the user submits the form
  onSubmit() {
    // the two passwords differ
    if (this.registerForm.hasError('passwordsDoNotMatch')) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      return;
    }

    // a field is empty or the password is too short
    if (this.registerForm.invalid) {
      this.errorMessage = 'Bitte alle Felder ausfüllen, Passwort mindestens 4 Zeichen';
      return;
    }

    // read the typed values, the ! says they are filled because we checked above
    const username = this.registerForm.value.username!;
    const password = this.registerForm.value.password!;

    // send them to the backend, the request only starts because of subscribe
    this.authService.register(username, password).subscribe({
      // the account was created, send the user to the login page
      next: () => {
        this.router.navigate(['/login']);
      },
      // the backend refused, or the server is not running
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
