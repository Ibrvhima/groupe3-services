import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  password = '';
  role = 'client';

  categorie_id = '';
  quartier = '';
  description = '';
  categories: any[] = [];

  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private prestataireService: PrestataireService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.prestataireService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';

    if (!this.nom || !this.prenom || !this.email || !this.telephone || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Mot de passe trop court.';
      this.cdr.detectChanges();
      return;
    }

    if (this.role === 'prestataire' && (!this.categorie_id || !this.quartier || !this.description)) {
      this.error = 'Complétez les infos professionnelles.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const data: any = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      password: this.password,
      role: this.role,
    };

    if (this.role === 'prestataire') {
      data.categorie_id = this.categorie_id;
      data.quartier = this.quartier;
      data.description = this.description;
      data.telephone_pro = this.telephone;
    }

    this.authService.register(data).subscribe({
      next: (res: any) => {
        this.loading = false;

        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('role', res.user.role);

        this.cdr.detectChanges();

        this.router.navigate([res.user.role === 'client' ? '/client/dashboard' : '/prestataire/dashboard']);
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.email) {
          this.error = 'Email pas valide.';
        } else {
          this.error = 'Erreur lors de l’inscription.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}