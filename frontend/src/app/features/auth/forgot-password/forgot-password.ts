import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {

  email   = '';
  loading = false;
  // Token retourné par l'API (en production ce serait envoyé par email)
  token   = '';
  error   = '';

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  soumettre(): void {
    if (!this.email.trim()) { this.error = 'Veuillez saisir votre email.'; return; }
    this.loading = true;
    this.error   = '';

    this.http.post<{ token: string }>(`${this.api}/users/password-reset/`, { email: this.email }).subscribe({
      next: res => {
        // En production, l'utilisateur reçoit un email.
        // En MVP, on affiche le token directement pour test.
        this.token   = res.token ?? '';
        this.loading = false;
      },
      error: () => {
        this.error   = 'Une erreur est survenue. Réessayez.';
        this.loading = false;
      },
    });
  }
}
