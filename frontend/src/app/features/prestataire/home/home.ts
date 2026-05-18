import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { PrestataireHeaderComponent } from '../layout/header/header';
import { Prestataire } from '../../../core/models';

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

  get user()       { return this.profil?.user ?? null; }
  get disponible() { return this.profil?.disponible ?? false; }

  constructor(
    private demandeService: DemandeService,
    private prestataireService: PrestataireService,
  ) {}

  ngOnInit(): void {
    // Stats via endpoint dédié (pas de troncature par pagination)
    forkJoin({
      profil: this.prestataireService.getMonProfil(),
      stats:  this.demandeService.getStats(),
    }).subscribe({
      next: ({ profil, stats }) => {
        this.profil = profil;
        this.stats  = stats;
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
