import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector:    'app-forgot-password',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  email       = '';
  loading     = false;
  sent        = false;
  error       = '';
  devResetUrl = '';   // lien visible uniquement en mode dev (DEBUG=True, pas de Resend)

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  soumettre(): void {
    if (!this.email.trim()) { this.error = 'Veuillez saisir votre email.'; return; }
    this.loading = true;
    this.error   = '';

    this.http.post<any>(`${this.api}/users/password-reset/`, { email: this.email }).subscribe({
      next: (res) => {
        this.devResetUrl = res?.dev_reset_url ?? '';
        this.sent        = true;
        this.loading     = false;
      },
      error: () => {
        this.error   = 'Une erreur est survenue. Réessayez.';
        this.loading = false;
      },
    });
  }
}
