import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _apiUrl = environment.globalBackendUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this._apiUrl}/login`, { email, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    // ✅ Vérifie que cette méthode existe bien
    return this.http.post<any>(`${this._apiUrl}/register`, {
      username,
      email,
      password,
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
