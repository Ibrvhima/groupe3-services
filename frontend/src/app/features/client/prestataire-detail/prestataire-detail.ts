import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { DemandeService } from '../../../core/services/demande.service';
import { AvisService } from '../../../core/services/avis.service';
import { HeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-prestataire-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './prestataire-detail.html',
})
export class PrestataireDetailComponent implements OnInit {
  prestataire: any = null;
  avis: any[]      = [];
  loading          = true;

  showDemandeForm = false;
  demande         = { description: '', adresse: '', date_souhaitee: '' };
  demandeLoading  = false;
  demandeSuccess  = false;
  demandeError    = '';

  constructor(
    private route: ActivatedRoute,
    private prestataireService: PrestataireService,
    private demandeService: DemandeService,
    private avisService: AvisService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const uuid = this.route.snapshot.params['uuid'];

    this.prestataireService.getByUuid(uuid).subscribe({
      next: (prestataire: any) => {
        this.prestataire = prestataire;
        // On récupère les avis via l'ID interne (non visible dans l'URL)
        this.avisService.getAvisPrestataire(prestataire.id).subscribe({
          next: (avis: any) => {
            this.avis    = Array.isArray(avis) ? avis : (avis.results ?? []);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleDemandeForm(): void {
    this.showDemandeForm = !this.showDemandeForm;
    this.demandeSuccess  = false;
    this.demandeError    = '';
  }

  envoyerDemande(): void {
    if (!this.demande.description || !this.demande.adresse) {
      this.demandeError = 'Veuillez remplir la description et l\'adresse.';
      return;
    }
    this.demandeLoading = true;
    this.demandeError   = '';

    const payload: any = {
      prestataire: this.prestataire.id,
      description: this.demande.description,
      adresse:     this.demande.adresse,
    };
    if (this.demande.date_souhaitee) payload.date_souhaitee = this.demande.date_souhaitee;

    this.demandeService.creerDemande(payload).subscribe({
      next: () => {
        this.demandeSuccess  = true;
        this.demandeLoading  = false;
        this.showDemandeForm = false;
        this.demande         = { description: '', adresse: '', date_souhaitee: '' };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.demandeError   = err?.error?.detail || 'Une erreur est survenue.';
        this.demandeLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Retourne un tableau [1..n] pour afficher les étoiles dans le template. */
  etoiles(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }
}
