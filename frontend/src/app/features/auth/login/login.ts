import { Component, ChangeDetectorRef } from '@angular/core';
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
  email = '';
  password = '';
  error = '';
  showPassword = false;
  rememberMe = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // 🔥 IMPORTANT
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      this.cdr.detectChanges(); // 🔥 force affichage
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);

        this.authService.getMe().subscribe({
          next: (user: any) => {
            this.loading = false;

            localStorage.setItem('role', user.role);
            localStorage.setItem('user', JSON.stringify(user));

            this.cdr.detectChanges();

            if (user.role === 'client') {
              this.router.navigate(['/client/dashboard']);
            } else if (user.role === 'prestataire') {
              this.router.navigate(['/prestataire/dashboard']);
            } else {
              this.router.navigate(['/admin']);
            }
          },
          error: () => {
            this.loading = false;
            this.error = 'Erreur récupération utilisateur.';
            this.cdr.detectChanges(); // 🔥
          }
        });
      },

      error: (err) => {
        this.loading = false;

        console.log('LOGIN ERROR:', err);

        // 🔥 message immédiat
        if (err.status === 401) {
          this.error = 'Email ou mot de passe incorrect.';
        } else {
          this.error = 'Erreur serveur.';
        }

        this.cdr.detectChanges(); //
      }
    });
  }
}