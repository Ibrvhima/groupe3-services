import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  showPassword = false;
  rememberMe = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
  if (!this.email || !this.password) {
    this.error = 'Veuillez remplir tous les champs.';
    return;
  }
  this.error = '';
  this.loading = true;

  this.authService.login(this.email, this.password).subscribe({
    next: () => {
      this.loading = false;
      // Récupérer le profil pour avoir le rôle
      this.authService.getMe().subscribe({
        next: (user: any) => {
          localStorage.setItem('role', user.role);
          localStorage.setItem('user', JSON.stringify(user));
          if (user.role === 'client') {
            this.router.navigate(['/client']);
          } else if (user.role === 'prestataire') {
            this.router.navigate(['/prestataire']);
          }
        }
      });
    },
    error: () => {
      this.loading = false;
      this.error = 'Email ou mot de passe incorrect.';
    }
  });
}
}