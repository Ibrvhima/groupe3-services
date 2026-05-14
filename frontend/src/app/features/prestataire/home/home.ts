import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { PrestataireHeaderComponent } from '../layout/header/header';
import { Prestataire, Demande } from '../../../core/models';

@Component({
  selector: 'app-prestataire-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PrestataireHeaderComponent],
  templateUrl: './home.html',
})
export class PrestataireHomeComponent implements OnInit {
  profil: Prestataire | null = null;
  stats = { en_attente: 0, acceptees: 0, terminees: 0, total: 0 };
  loading           = true;
  disponibleLoading = false;

  // Getters pour compatibilité avec le template existant
  get user()       { return this.profil?.user ?? null; }
  get disponible() { return this.profil?.disponible ?? false; }

  constructor(
    private demandeService: DemandeService,
    private prestataireService: PrestataireService,
  ) {}

  ngOnInit(): void {
    // Charge profil + demandes en parallèle via forkJoin
    forkJoin({
      profil:   this.prestataireService.getMonProfil(),
      demandes: this.demandeService.getMesDemandes(),
    }).subscribe({
      next: ({ profil, demandes }) => {
        this.profil = profil;
        const list  = demandes.results ?? [];
        this.stats  = {
          total:      list.length,
          en_attente: list.filter((d: Demande) => d.statut === 'en_attente').length,
          acceptees:  list.filter((d: Demande) => d.statut === 'acceptee' || d.statut === 'en_cours').length,
          terminees:  list.filter((d: Demande) => d.statut === 'terminee').length,
        };
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  toggleDisponible(): void {
    if (!this.profil) return;
    this.disponibleLoading = true;
    this.prestataireService.updateProfil(this.profil.id, { disponible: !this.profil.disponible }).subscribe({
      next: updated => {
        if (this.profil) this.profil.disponible = updated.disponible;
        this.disponibleLoading = false;
      },
      error: () => { this.disponibleLoading = false; },
    });
  }
}
