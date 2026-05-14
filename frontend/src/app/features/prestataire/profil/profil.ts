import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { PrestataireHeaderComponent } from '../layout/header/header';
import { Prestataire, Categorie } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-prestataire-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, PrestataireHeaderComponent],
  templateUrl: './profil.html',
})
export class PrestataireProfilComponent implements OnInit {

  profil: Prestataire | null = null;
  categories: Categorie[]   = [];
  loading  = true;
  saving   = false;
  success  = '';
  error    = '';

  // Champs du formulaire
  form = {
    description:  '',
    quartier:     '',
    telephone:    '',
    categorie_id: null as number | null,
  };

  // Fichier photo sélectionné
  photoFile: File | null = null;
  // Prévisualisation locale avant upload
  photoPreview: string | null = null;

  // Les photos sont servies via nginx sur le même domaine que l'app
  readonly mediaUrl = '';

  constructor(
    private prestataireService: PrestataireService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Charge le profil et les catégories en parallèle
    this.prestataireService.getMonProfil().subscribe({
      next: profil => {
        this.profil = profil;
        // Pré-remplit le formulaire avec les valeurs actuelles
        this.form = {
          description:  profil.description,
          quartier:     profil.quartier,
          telephone:    profil.telephone,
          categorie_id: profil.categorie?.id ?? null,
        };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });

    this.prestataireService.getCategories().subscribe({
      next: cats => this.categories = cats,
    });
  }

  /** Appelé quand l'utilisateur sélectionne un fichier image */
  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Vérifie que c'est bien une image et < 5 Mo
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner une image.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La photo ne doit pas dépasser 5 Mo.';
      return;
    }

    this.photoFile  = file;
    this.error      = '';

    // Génère une prévisualisation locale sans attendre l'upload
    const reader = new FileReader();
    reader.onload = e => this.photoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  /** Soumet les modifications du profil */
  sauvegarder(): void {
    if (!this.profil) return;
    this.saving  = true;
    this.success = '';
    this.error   = '';

    // FormData obligatoire dès qu'il y a un fichier à envoyer
    const formData = new FormData();
    formData.append('description', this.form.description);
    formData.append('quartier',    this.form.quartier);
    formData.append('telephone',   this.form.telephone);
    if (this.form.categorie_id) {
      formData.append('categorie', String(this.form.categorie_id));
    }
    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }

    this.prestataireService.updateProfilAvecPhoto(this.profil.id, formData).subscribe({
      next: updated => {
        this.profil  = updated;
        this.success = 'Profil mis à jour avec succès.';
        this.saving  = false;
        // Réinitialise le fichier sélectionné après upload réussi
        this.photoFile = null;
      },
      error: () => {
        this.error  = 'Une erreur est survenue. Vérifiez les champs.';
        this.saving = false;
      },
    });
  }

  retour(): void {
    this.router.navigate(['/prestataire']);
  }
}
