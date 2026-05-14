import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {

  token    = '';
  password = '';
  confirm  = '';
  loading  = false;
  succes   = false;
  error    = '';

  private api = environment.apiUrl;

  constructor(
    private http:  HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Récupère le token depuis l'URL (?token=uuid...)
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  soumettre(): void {
    this.error = '';

    if (!this.token) {
      this.error = 'Token manquant. Recommencez la procédure.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.http.post(`${this.api}/users/password-reset/confirm/`, {
      token:    this.token,
      password: this.password,
    }).subscribe({
      next: () => {
        this.succes  = true;
        this.loading = false;
        // Redirige vers la connexion après 2 secondes
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: err => {
        this.error   = err?.error?.detail ?? 'Token invalide ou expiré.';
        this.loading = false;
      },
    });
  }
}
