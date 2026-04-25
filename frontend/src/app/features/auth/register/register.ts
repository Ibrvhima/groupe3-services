import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PrestataireService } from '../../../core/services/prestataire.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent implements OnInit {
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  role = 'client';
  password = '';
  error = '';
  showPassword = false;
  loading = false;

  // Champs prestataire
  categorie_id = '';
  quartier = '';
  description = '';
  categories: any[] = [];

  constructor(
    private authService: AuthService,
    private prestataireService: PrestataireService,
    private router: Router
  ) {}

  ngOnInit() {
    this.prestataireService.getCategories().subscribe({
      next: (data: any) => this.categories = data,
      error: (err) => console.error(err)
    });
  }

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
    if (this.role === 'prestataire' && (!this.categorie_id || !this.quartier || !this.description)) {
      this.error = 'Veuillez remplir toutes les informations professionnelles.';
      return;
    }

    this.error = '';
    this.loading = true;

    const data: any = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      role: this.role,
      password: this.password,
    };

    if (this.role === 'prestataire') {
      data.categorie_id  = this.categorie_id;
      data.quartier      = this.quartier;
      data.description   = this.description;
      data.telephone_pro = this.telephone;
    }

    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
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