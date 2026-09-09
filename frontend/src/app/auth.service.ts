// tools for creating a service and asking Angular for other services
import { Injectable, inject } from '@angular/core';
// service that sends HTTP requests to the backend
import { HttpClient } from '@angular/common/http';

// shape of the user data the backend sends back
export interface User {
  id: number;
  username: string;
}

// providedIn root means: one instance, available in every component
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ask Angular for the HttpClient
  private http = inject(HttpClient);
  // base address of the auth endpoints
  private apiUrl = 'http://localhost:3000/api/auth';
  // name under which we store the logged in user in the browser
  private storageKey = 'sprout-user';

  // send username and password to the register endpoint
  register(username: string, password: string) {
    return this.http.post<User>(this.apiUrl + '/register', {
      username: username,
      password: password,
    });
  }

  // send username and password to the login endpoint
  login(username: string, password: string) {
    return this.http.post<User>(this.apiUrl + '/login', { username: username, password: password });
  }

  // remember the logged in user in the browser
  saveUser(user: User) {
    // localStorage only stores text, so turn the object into a string
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  // forget the logged in user
  logout() {
    localStorage.removeItem(this.storageKey);
  }

  // read the logged in user, or null if nobody is logged in
  getCurrentUser(): User | null {
    // read the stored text
    const storedText = localStorage.getItem(this.storageKey);

    // nothing stored means nobody is logged in
    if (!storedText) {
      return null;
    }

    // turn the text back into an object
    return JSON.parse(storedText);
  }

  // true if somebody is logged in, used by the guard
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}
