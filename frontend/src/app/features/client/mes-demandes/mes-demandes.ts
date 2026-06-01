import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandeService } from '../../../core/services/demande.service';
import { AvisService } from '../../../core/services/avis.service';
import { DevisService } from '../../../core/services/devis.service';
import { HeaderComponent } from '../layout/header/header';
import { Demande } from '../../../core/models';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './mes-demandes.html',
})
export class MesDemandesComponent implements OnInit {
  demandes: Demande[] = [];
  loading             = true;
  actionLoading: number | null = null;
  activeTab           = 'toutes';

  avisDemandeId: number | null = null;
  avisNote        = 0;
  avisCommentaire = '';
  avisLoading     = false;
  avisError       = '';

  devisActionLoading: number | null = null;

  readonly tabs = [
    { key: 'toutes',    label: 'Toutes'    },
    { key: 'en_cours',  label: 'En cours'  },
    { key: 'en_attente',label: 'En attente'},
    { key: 'terminees', label: 'Terminées' },
  ];

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

  get demandesFiltrees(): Demande[] {
    if (this.activeTab === 'en_cours')   return this.demandes.filter(d => ['acceptee','en_cours'].includes(d.statut));
    if (this.activeTab === 'en_attente') return this.demandes.filter(d => d.statut === 'en_attente');
    if (this.activeTab === 'terminees')  return this.demandes.filter(d => ['terminee','refusee','annulee'].includes(d.statut));
    return this.demandes;
  }

  countTab(key: string): number {
    if (key === 'en_cours')   return this.demandes.filter(d => ['acceptee','en_cours'].includes(d.statut)).length;
    if (key === 'en_attente') return this.demandes.filter(d => d.statut === 'en_attente').length;
    if (key === 'terminees')  return this.demandes.filter(d => ['terminee','refusee','annulee'].includes(d.statut)).length;
    return this.demandes.length;
  }

  annuler(id: number): void {
    this.actionLoading = id;
    this.demandeService.annuler(id).subscribe({
      next: updated => { this._maj(updated); this.actionLoading = null; },
      error: ()      => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  accepterDevis(d: Demande): void {
    if (!d.devis) return;
    this.devisActionLoading = d.id;
    this.devisService.accepter(d.devis.id).subscribe({
      next: devisUpdated => {
        this.demandes = this.demandes.map(x =>
          x.id === d.id ? { ...x, statut: 'en_cours', statut_display: 'En cours', devis: devisUpdated } : x
        );
        this.devisActionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.devisActionLoading = null; this.cdr.detectChanges(); },
    });
  }

  refuserDevis(d: Demande): void {
    if (!d.devis) return;
    this.devisActionLoading = d.id;
    this.devisService.refuser(d.devis.id).subscribe({
      next: devisUpdated => {
        this.demandes = this.demandes.map(x => x.id === d.id ? { ...x, devis: devisUpdated } : x);
        this.devisActionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.devisActionLoading = null; this.cdr.detectChanges(); },
    });
  }

  ouvrirAvis(demandeId: number): void {
    this.avisDemandeId  = demandeId;
    this.avisNote       = 0;
    this.avisCommentaire = '';
    this.avisError      = '';
  }

  fermerAvis(): void { this.avisDemandeId = null; }

  setNote(n: number): void { this.avisNote = n; }

  envoyerAvis(): void {
    if (!this.avisNote)               { this.avisError = 'Choisissez une note.';    return; }
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

  avatarClass(d: Demande): string {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
    const idx = (d.prestataire_info?.user?.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-orange-500';
  }

  initiales(d: Demande): string {
    const n = d.prestataire_info?.user?.nom?.charAt(0) ?? '';
    const p = d.prestataire_info?.user?.prenom?.charAt(0) ?? '';
    return (n + p).toUpperCase();
  }

  tempsEcoule(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60)  return `il y a ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `il y a ${h}h`;
    const j = Math.floor(h / 24);
    return `il y a ${j}j`;
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-700',
      acceptee:   'bg-sky-100 text-sky-700',
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

  private _maj(updated: Demande): void {
    this.demandes = this.demandes.map(d => d.id === updated.id ? updated : d);
    this.cdr.detectChanges();
  }
}
