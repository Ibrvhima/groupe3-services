import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../core/services/demande.service';
import { DevisService } from '../../../core/services/devis.service';
import { PrestataireHeaderComponent } from '../layout/header/header';
import { Demande } from '../../../core/models';

@Component({
  selector: 'app-prestataire-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PrestataireHeaderComponent],
  templateUrl: './demandes.html',
})
export class PrestataireDemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading = true;
  actionLoading: number | null = null;
  activeTab = 'en_attente';

  devisDemandeId: number | null = null;
  devisMontant = '';
  devisDescription = '';
  devisDelai = '';
  devisLoading = false;
  devisError = '';

  constructor(
    private demandeService: DemandeService,
    private devisService: DevisService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.loading = true;
    this.demandeService.getMesDemandes().subscribe({
      next: (data: any) => {
        this.demandes = Array.isArray(data) ? data : (data.results ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get demandesFiltrees(): Demande[] {
    if (this.activeTab === 'en_attente') {
      return this.demandes.filter(d => d.statut === 'en_attente');
    }
    if (this.activeTab === 'en_cours') {
      return this.demandes.filter(d => ['acceptee', 'en_cours'].includes(d.statut));
    }
    return this.demandes.filter(d => ['terminee', 'refusee', 'annulee'].includes(d.statut));
  }

  accepter(id: number): void { this._action(id, () => this.demandeService.accepter(id)); }
  refuser(id: number): void { this._action(id, () => this.demandeService.refuser(id)); }
  terminer(id: number): void { this._action(id, () => this.demandeService.terminer(id)); }

  // factorisé pour éviter la duplication entre accepter/refuser/terminer
  private _action(id: number, call: () => any): void {
    this.actionLoading = id;
    call().subscribe({
      next: (updated: Demande) => {
        this.demandes = this.demandes.map(d => d.id === id ? updated : d);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  ouvrirFormulaireDevis(demandeId: number): void {
    this.devisDemandeId = demandeId;
    this.devisMontant = '';
    this.devisDescription = '';
    this.devisDelai = '';
    this.devisError = '';
  }

  fermerFormulaireDevis(): void {
    this.devisDemandeId = null;
  }

  envoyerDevis(): void {
    const montant = parseFloat(this.devisMontant);
    if (!montant || montant <= 0)         { this.devisError = 'Entrez un montant valide.';          return; }
    if (!this.devisDescription.trim())    { this.devisError = 'La description est obligatoire.';    return; }
    if (!this.devisDelai.trim())          { this.devisError = 'Précisez le délai d\'intervention.'; return; }

    this.devisLoading = true;
    this.devisError = '';

    this.devisService.creerDevis({
      demande: this.devisDemandeId!,
      montant: montant,
      description: this.devisDescription.trim(),
      delai: this.devisDelai.trim(),
    }).subscribe({
      next: devisCreated => {
        this.demandes = this.demandes.map(d =>
          d.id === this.devisDemandeId
            ? { ...d, has_devis: true, devis: devisCreated }
            : d
        );
        this.devisLoading = false;
        this.devisDemandeId = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const e = err?.error;
        this.devisError = typeof e === 'string'
          ? 'Erreur serveur. Veuillez réessayer.'
          : e?.detail ?? e?.non_field_errors?.[0] ?? e?.demande?.[0]
            ?? (Array.isArray(e) ? e[0] : null) ?? 'Erreur lors de l\'envoi.';
        this.devisLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-700',
      acceptee: 'bg-sky-100 text-sky-700',
      refusee: 'bg-red-100 text-red-600',
      en_cours: 'bg-indigo-100 text-indigo-700',
      terminee: 'bg-green-100 text-green-700',
      annulee: 'bg-gray-100 text-gray-500',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }

  devisStatutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-orange-100 text-orange-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-gray-100 text-gray-500',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }
}
