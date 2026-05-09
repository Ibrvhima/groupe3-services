import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DemandeService } from '../../../core/services/demande.service';

import { HeaderClientComponent } from '../layout/header-client/header-client';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderClientComponent
  ],
  templateUrl: './demandes.html',
})
export class DemandesComponent implements OnInit {

  // =========================
  // DATA
  // =========================

  demandes: any[] = [];

  // =========================
  // UI
  // =========================

  loading = true;
  error = '';

  // =========================
  // STATS
  // =========================

  total = 0;
  enAttente = 0;
  acceptees = 0;
  terminees = 0;
  refusees = 0;

  constructor(
    private demandeService: DemandeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  // =========================
  // LOAD DEMANDES
  // =========================

  loadDemandes(): void {

    // 🔥 IMPORTANT
    this.loading = true;
    this.error = '';

    this.demandeService.getMesDemandes().subscribe({

      next: (data: any) => {

        // 🔥 FIX LOADING BUG
        this.demandes = Array.isArray(data)
          ? data
          : data.results || [];

        this.calculateStats();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.log(err);

        this.error = 'Impossible de charger les demandes';

        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }

  // =========================
  // CALCUL STATS
  // =========================

  calculateStats(): void {

    this.total = this.demandes.length;

    this.enAttente = this.demandes.filter(
      d => d.statut === 'en_attente'
    ).length;

    this.acceptees = this.demandes.filter(
      d => d.statut === 'acceptee'
    ).length;

    this.terminees = this.demandes.filter(
      d => d.statut === 'terminee'
    ).length;

    this.refusees = this.demandes.filter(
      d => d.statut === 'annulee'
    ).length;
  }

  // =========================
  // STATUS STYLE
  // =========================

  getStatusClass(statut: string): string {

    switch (statut) {

      case 'en_attente':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';

      case 'acceptee':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';

      case 'terminee':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

      case 'annulee':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';

      default:
        return 'bg-gray-800 text-gray-300 border border-gray-700';
    }
  }

}