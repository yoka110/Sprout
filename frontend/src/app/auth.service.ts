import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';
  private storageKey = 'sprout-user';

  register(username: string, password: string) {
    return this.http.post<User>(this.apiUrl + '/register', {
      username: username,
      password: password,
    });
  }

  login(username: string, password: string) {
    return this.http.post<User>(this.apiUrl + '/login', { username: username, password: password });
  }

  // F-17: the logged in user lives in localStorage, there is no token
  saveUser(user: User) {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getCurrentUser(): User | null {
    const storedText = localStorage.getItem(this.storageKey);

    if (!storedText) {
      return null;
    }

    return JSON.parse(storedText);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}
