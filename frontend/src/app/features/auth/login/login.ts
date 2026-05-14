import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  email        = '';
  password     = '';
  error        = '';
  showPassword = false;
  rememberMe   = false;
  loading      = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    this.error   = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: res => {
        this.loading = false;
        // Redirection directe depuis la réponse — pas de second appel réseau
        const role = res.user?.role;
        if (role === 'client')      this.router.navigate(['/client']);
        else if (role === 'prestataire') this.router.navigate(['/prestataire']);
        else if (role === 'admin')  this.router.navigate(['/admin']);
        else                        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect.';
      },
    });
  }
}
