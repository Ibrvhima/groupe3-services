import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  role = 'client';
  password = '';
  error = '';
  showPassword = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.nom || !this.prenom || !this.email || !this.telephone || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    this.error = '';
    this.loading = true;

    this.authService.register({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      role: this.role,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        const role = res.user?.role;
        if (role === 'client') {
          this.router.navigate(['/client']);
        } else if (role === 'prestataire') {
          this.router.navigate(['/prestataire']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.email) {
          this.error = 'Cet email est déjà utilisé.';
        } else {
          this.error = 'Une erreur est survenue. Réessayez.';
        }
      }
    });
  }
}