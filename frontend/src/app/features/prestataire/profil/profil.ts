import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { AuthService } from '../../../core/services/auth.service';
import { PrestataireSidebarComponent } from '../layout/sidebar/sidebar';
import { Prestataire, Categorie } from '../../../core/models';

@Component({
  selector: 'app-prestataire-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, PrestataireSidebarComponent],
  templateUrl: './profil.html',
})
export class PrestataireProfilComponent implements OnInit {
  profil: Prestataire | null = null;
  categories: Categorie[]   = [];
  loading  = true;
  saving   = false;
  success  = '';
  error    = '';

  form = {
    nom:          '',
    prenom:       '',
    description:  '',
    quartier:     '',
    telephone:    '',
    categorie_id: null as number | null,
    disponible:   true,
  };

  deleting      = false;
  confirmDelete = false;

  photoFile: File | null    = null;
  photoPreview: string | null = null;
  readonly mediaUrl = '';

  constructor(
    private prestataireService: PrestataireService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.prestataireService.getMonProfil().subscribe({
      next: profil => {
        this.profil = profil;
        this.form = {
          nom:          profil.user?.nom   ?? '',
          prenom:       profil.user?.prenom ?? '',
          description:  profil.description,
          quartier:     profil.quartier,
          telephone:    profil.telephone,
          categorie_id: profil.categorie?.id ?? null,
          disponible:   profil.disponible ?? true,
        };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });

    this.prestataireService.getCategories().subscribe({
      next: cats => this.categories = cats,
    });
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner une image.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La photo ne doit pas dépasser 5 Mo.';
      return;
    }

    this.photoFile = file;
    this.error     = '';

    const reader = new FileReader();
    reader.onload = e => this.photoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  sauvegarder(): void {
    if (!this.profil) return;
    this.saving  = true;
    this.success = '';
    this.error   = '';

    // Mise à jour infos personnelles (nom/prénom)
    const userFd = new FormData();
    userFd.append('nom',    this.form.nom);
    userFd.append('prenom', this.form.prenom);
    this.authService.updateMe(userFd).subscribe();

    // Mise à jour profil prestataire
    const formData = new FormData();
    formData.append('description', this.form.description);
    formData.append('quartier',    this.form.quartier);
    formData.append('telephone',   this.form.telephone);
    if (this.form.categorie_id) {
      formData.append('categorie', String(this.form.categorie_id));
    }
    formData.append('disponible', String(this.form.disponible));
    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }

    this.prestataireService.updateProfilAvecPhoto(this.profil.uuid, formData).subscribe({
      next: updated => {
        this.profil    = updated;
        this.success   = 'Profil mis à jour avec succès.';
        this.saving    = false;
        this.photoFile = null;
      },
      error: () => {
        this.error  = 'Une erreur est survenue. Vérifiez les champs.';
        this.saving = false;
      },
    });
  }

  toggleDisponible(): void {
    this.form.disponible = !this.form.disponible;
  }

  supprimerCompte(): void {
    this.deleting = true;
    this.authService.deleteAccount().subscribe({
      next: () => this.authService.logout(),
      error: () => {
        this.error    = 'Impossible de supprimer le compte.';
        this.deleting = false;
      },
    });
  }

  retour(): void {
    this.router.navigate(['/prestataire']);
  }
}
