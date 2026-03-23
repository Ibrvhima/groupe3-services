import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/token/`, { email, password });
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/users/register/`, data);
  }

  logout() { localStorage.removeItem('token'); }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
}
