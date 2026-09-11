import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

// cross-field validator: password and its repetition must match, only a typing safeguard (F-26)
export function passwordsMatch(group: AbstractControl) {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordsDoNotMatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';

  registerForm = new FormGroup(
    {
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatch },
  );

  onSubmit() {
    if (this.registerForm.hasError('passwordsDoNotMatch')) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      return;
    }

    if (this.registerForm.invalid) {
      this.errorMessage = 'Bitte alle Felder ausfüllen, Passwort mindestens 4 Zeichen';
      return;
    }

    const username = this.registerForm.value.username!;
    const password = this.registerForm.value.password!;

    this.authService.register(username, password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (response) => {
        if (response.error && response.error.error) {
          this.errorMessage = response.error.error;
        } else {
          this.errorMessage = 'Server nicht erreichbar';
        }
      },
    });
  }
}
