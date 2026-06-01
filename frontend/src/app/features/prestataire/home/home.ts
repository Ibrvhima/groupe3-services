import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { PrestataireSidebarComponent } from '../layout/sidebar/sidebar';
import { Prestataire, Demande, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-prestataire-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PrestataireSidebarComponent],
  templateUrl: './home.html',
})
export class PrestataireHomeComponent implements OnInit {
  profil: Prestataire | null = null;
  stats = { en_attente: 0, acceptees: 0, terminees: 0, total: 0 };
  demandesRecentes: Demande[] = [];
  loading           = true;
  disponibleLoading = false;
  actionLoading: number | null = null;

  get user()       { return this.profil?.user ?? null; }
  get disponible() { return this.profil?.disponible ?? false; }

  constructor(
    private demandeService: DemandeService,
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      profil:   this.prestataireService.getMonProfil(),
      stats:    this.demandeService.getStats(),
      demandes: this.demandeService.getMesDemandes(),
    }).subscribe({
      next: ({ profil, stats, demandes }) => {
        this.profil           = profil;
        this.stats            = stats;
        const list = Array.isArray(demandes) ? demandes : (demandes as PaginatedResponse<Demande>).results;
        this.demandesRecentes = list.slice(0, 3);
        this.loading          = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  toggleDisponible(): void {
    if (!this.profil) return;
    this.disponibleLoading = true;
    this.prestataireService.updateProfil(this.profil.uuid, { disponible: !this.profil.disponible }).subscribe({
      next: updated => {
        if (this.profil) this.profil.disponible = updated.disponible;
        this.disponibleLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.disponibleLoading = false; this.cdr.detectChanges(); },
    });
  }

  accepter(d: Demande): void {
    this.actionLoading = d.id;
    this.demandeService.accepter(d.id).subscribe({
      next: updated => {
        this.demandesRecentes = this.demandesRecentes.map(x => x.id === d.id ? updated : x);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  refuser(d: Demande): void {
    this.actionLoading = d.id;
    this.demandeService.refuser(d.id).subscribe({
      next: updated => {
        this.demandesRecentes = this.demandesRecentes.map(x => x.id === d.id ? updated : x);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
      acceptee:   'bg-blue-50 text-blue-700 border border-blue-100',
      en_cours:   'bg-indigo-50 text-indigo-700 border border-indigo-100',
      terminee:   'bg-green-50 text-green-700 border border-green-100',
      refusee:    'bg-red-50 text-red-500 border border-red-100',
      annulee:    'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }

  initiales(): string {
    const n = this.user?.nom?.charAt(0) ?? '';
    const p = this.user?.prenom?.charAt(0) ?? '';
    return (n + p).toUpperCase();
  }
}
