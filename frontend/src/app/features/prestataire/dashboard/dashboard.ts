import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderPrestataireComponent } from '../layout/header-prestataire/header-prestataire';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderPrestataireComponent
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {

  demandes: any[] = [];

  loading = true;

  total = 0;
  enAttente = 0;
  acceptees = 0;
  terminees = 0;

  constructor(
    private demandeService: DemandeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {

    this.loading = true;

    this.demandeService.getDemandesPrestataire().subscribe({

      next: (data: any) => {

        console.log('📡 DEMANDES:', data);

        if (Array.isArray(data)) {
          this.demandes = data;
        } else if (data?.results) {
          this.demandes = data.results;
        } else {
          this.demandes = [];
        }

        this.calculStats();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.log('❌ ERROR:', err);

        this.loading = false;
        this.demandes = [];

        this.cdr.detectChanges();
      }

    });
  }

  calculStats() {

    this.total = this.demandes.length;

    this.enAttente =
      this.demandes.filter(
        d => d.statut === 'en_attente'
      ).length;

    this.acceptees =
      this.demandes.filter(
        d => d.statut === 'acceptee'
      ).length;

    this.terminees =
      this.demandes.filter(
        d => d.statut === 'terminee'
      ).length;
  }

  getStatusClass(statut: string) {

    switch (statut) {

      case 'en_attente':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

      case 'acceptee':
        return 'bg-green-500/10 text-green-400 border-green-500/20';

      case 'terminee':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

      case 'annulee':
        return 'bg-red-500/10 text-red-400 border-red-500/20';

      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  }
}