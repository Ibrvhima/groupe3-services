import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../core/services/demande.service';
import { AvisService }    from '../../../core/services/avis.service';
import { DevisService }   from '../../../core/services/devis.service';
import { HeaderComponent } from '../layout/header/header';
import { Demande } from '../../../core/models';

@Component({
  selector:    'app-mes-demandes',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './mes-demandes.html',
})
export class MesDemandesComponent implements OnInit {
  demandes: Demande[]           = [];
  loading                       = true;
  actionLoading: number | null  = null;

  avisDemandeId: number | null  = null;
  avisNote                      = 0;
  avisCommentaire               = '';
  avisLoading                   = false;
  avisError                     = '';

  devisActionLoading: number | null = null;

  constructor(
    private demandeService: DemandeService,
    private avisService:    AvisService,
    private devisService:   DevisService,
    private cdr:            ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.loading = true;
    this.demandeService.getMesDemandes().subscribe({
      next: (data: any) => {
        this.demandes = Array.isArray(data) ? data : (data.results ?? []);
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  annuler(id: number): void {
    this.actionLoading = id;
    this.demandeService.annuler(id).subscribe({
      next:  updated => { this._majDemande(updated); this.actionLoading = null; },
      error: ()      => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  accepterDevis(demande: Demande): void {
    if (!demande.devis) return;
    this.devisActionLoading = demande.id;

    this.devisService.accepter(demande.devis.id).subscribe({
      next: devisUpdated => {
        this.demandes = this.demandes.map(d =>
          d.id === demande.id
            ? { ...d, statut: 'en_cours', statut_display: 'En cours', devis: devisUpdated }
            : d
        );
        this.devisActionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.devisActionLoading = null; this.cdr.detectChanges(); },
    });
  }

  refuserDevis(demande: Demande): void {
    if (!demande.devis) return;
    this.devisActionLoading = demande.id;

    this.devisService.refuser(demande.devis.id).subscribe({
      next: devisUpdated => {
        this.demandes = this.demandes.map(d =>
          d.id === demande.id ? { ...d, devis: devisUpdated } : d
        );
        this.devisActionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.devisActionLoading = null; this.cdr.detectChanges(); },
    });
  }

  ouvrirAvis(demandeId: number): void {
    this.avisDemandeId   = demandeId;
    this.avisNote        = 0;
    this.avisCommentaire = '';
    this.avisError       = '';
  }

  fermerAvis(): void { this.avisDemandeId = null; }

  setNote(n: number): void { this.avisNote = n; }

  envoyerAvis(): void {
    if (!this.avisNote)              { this.avisError = 'Choisissez une note.';      return; }
    if (!this.avisCommentaire.trim()) { this.avisError = 'Ajoutez un commentaire.'; return; }

    this.avisLoading = true;
    this.avisError   = '';

    this.avisService.creerAvis({
      demande:     this.avisDemandeId!,
      note:        this.avisNote,
      commentaire: this.avisCommentaire,
    }).subscribe({
      next: () => {
        this.demandes = this.demandes.map(d =>
          d.id === this.avisDemandeId ? { ...d, has_avis: true } : d
        );
        this.avisLoading   = false;
        this.avisDemandeId = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.avisError   = err?.error?.detail ?? err?.error?.[0] ?? 'Erreur lors de l\'envoi.';
        this.avisLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private _majDemande(updated: Demande): void {
    this.demandes = this.demandes.map(d => d.id === updated.id ? updated : d);
    this.cdr.detectChanges();
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-700',
      acceptee:   'bg-blue-100 text-blue-700',
      refusee:    'bg-red-100 text-red-600',
      en_cours:   'bg-indigo-100 text-indigo-700',
      terminee:   'bg-green-100 text-green-700',
      annulee:    'bg-gray-100 text-gray-500',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }

  devisStatutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-orange-100 text-orange-700',
      accepte:    'bg-green-100 text-green-700',
      refuse:     'bg-gray-100 text-gray-500',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }
}
