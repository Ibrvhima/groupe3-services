import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any) {
    return this.http.post(`${this.api}/register/`, data).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  login(email: string, password: string) {
    return this.http.post(`${this.api}/login/`, { email, password }).pipe(
      tap((res: any) => this.saveSession(res))
    );
  }

  getMe() {
    return this.http.get(`${this.api}/me/`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  logout() {
    // ✅ FIX ICI (OBLIGATOIRE)
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

  private saveSession(res: any) {
    localStorage.setItem('access_token', res.access);
    localStorage.setItem('refresh_token', res.refresh);
  }

  // ---  GESTION DE MOT DE PASSE OUBLIE --- //

 /*  forgotPassword(email: string) {
        return this.http.post(`${this.apiUrl}/users/forgot-password/`, { email });
     }

     resetPassword(token: string, password: string) {
        return this.http.post(`${this.apiUrl}/users/reset-password/`, {
       token,
       password,
     });
}  */

}