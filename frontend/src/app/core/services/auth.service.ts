import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: Partial<User> & { password: string; categorie_id?: string; quartier?: string; description?: string }) {
    return this.http.post<AuthResponse>(`${this.api}/register/`, data).pipe(
      tap(res => this._storeSession(res))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/login/`, { email, password }).pipe(
      tap(res => this._storeSession(res))
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  /** Stocke tokens + infos utilisateur après login ou register. */
  private _storeSession(res: AuthResponse): void {
    localStorage.setItem('access_token',  res.access);
    localStorage.setItem('refresh_token', res.refresh);
    if (res.user?.role)  localStorage.setItem('role', res.user.role);
    if (res.user)        localStorage.setItem('user', JSON.stringify(res.user));
  }
}
