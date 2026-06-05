import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-client-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './profil.html',
})
export class ClientProfilComponent implements OnInit {
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  saving  = false;
  deleting = false;
  success = '';
  error   = '';
  confirmDelete = false;

  form = {
    nom:       '',
    prenom:    '',
    telephone: '',
  };

  photoFile: File | null = null;
  photoPreview: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = {
      nom:       this.user.nom      || '',
      prenom:    this.user.prenom   || '',
      telephone: this.user.telephone || '',
    };
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) { this.error = 'Veuillez sélectionner une image.'; return; }
    if (file.size > 5 * 1024 * 1024)    { this.error = 'La photo ne doit pas dépasser 5 Mo.'; return; }
    this.photoFile = file;
    this.error = '';
    const reader = new FileReader();
    reader.onload = e => this.photoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  sauvegarder(): void {
    this.saving  = true;
    this.success = '';
    this.error   = '';

    const fd = new FormData();
    fd.append('nom',       this.form.nom);
    fd.append('prenom',    this.form.prenom);
    fd.append('telephone', this.form.telephone);
    if (this.photoFile) fd.append('photo', this.photoFile);

    this.authService.updateMe(fd).subscribe({
      next: updated => {
        this.user     = updated;
        this.success  = 'Profil mis à jour avec succès.';
        this.saving   = false;
        this.photoFile = null;
      },
      error: () => {
        this.error  = 'Une erreur est survenue.';
        this.saving = false;
      },
    });
  }

  supprimerCompte(): void {
    this.deleting = true;
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
      },
      error: () => {
        this.error    = 'Impossible de supprimer le compte.';
        this.deleting = false;
      },
    });
  }
}
