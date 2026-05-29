import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { Categorie } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent implements OnInit {
  nom      = '';
  prenom   = '';
  email    = '';
  telephone = '';
  role     = 'client';
  password = '';
  error    = '';
  showPassword = false;
  loading  = false;

  categorie_id = '';
  quartier     = '';
  description  = '';
  categories: Categorie[] = [];

  constructor(
    private authService: AuthService,
    private prestataireService: PrestataireService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.prestataireService.getCategories().subscribe({
      next: data => (this.categories = data),
      error: err  => console.error('Erreur chargement catégories', err),
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
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

    this.error   = '';
    this.loading = true;

    const payload: any = {
      nom: this.nom, prenom: this.prenom,
      email: this.email, telephone: this.telephone,
      role: this.role, password: this.password,
    };

    if (this.role === 'prestataire') {
      payload.categorie_id  = this.categorie_id;
      payload.quartier      = this.quartier;
      payload.description   = this.description;
      payload.telephone_pro = this.telephone;
    }

    this.authService.register(payload).subscribe({
      next: res => {
        this.loading = false;
        const role = res.user?.role || this.role;
        this.router.navigate([`/${role}`]);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.email
          ? 'Cet email est déjà utilisé.'
          : 'Une erreur est survenue. Réessayez.';
      },
    });
  }
}
