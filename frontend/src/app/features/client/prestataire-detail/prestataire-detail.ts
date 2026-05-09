import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { HeaderClientComponent } from '../layout/header-client/header-client';

@Component({
  selector: 'app-prestataire-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderClientComponent],
  templateUrl: './prestataire-detail.html',
})
export class PrestataireDetailComponent implements OnInit {

  prestataire: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private prestataireService: PrestataireService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPrestataire();
  }

  // 🔥 LOAD DATA
  loadPrestataire() {
    this.loading = true;
    this.error = '';

    const id = this.route.snapshot.params['id'];

    if (!id) {
      this.error = 'Prestataire introuvable';
      this.loading = false;
      return;
    }

    this.prestataireService.getById(id).subscribe({

      next: (data: any) => {
        console.log('📡 PRESTATAIRE:', data);

        this.prestataire = data;
        this.loading = false;

        // 🔥 FORCE REFRESH UI
        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.log('❌ ERROR:', err);

        this.error = 'Impossible de charger le prestataire.';
        this.prestataire = null;
        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }

  // 🔙 RETOUR
  goBack() {
    this.router.navigate(['/client']);
  }

  // 📩 NAVIGATION DEMANDE
  envoyerDemande() {
    if (!this.prestataire?.id) return;

    console.log('👉 envoyer demande vers:', this.prestataire.id);

    this.router.navigate([
      '/client/demande-form',
      this.prestataire.id
    ]);
  }

  // 🔤 INITIALS AVATAR
  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }
}