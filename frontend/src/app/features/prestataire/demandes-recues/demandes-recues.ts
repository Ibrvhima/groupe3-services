import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPrestataireComponent } from '../layout/header-prestataire/header-prestataire';
import { DemandeService } from '../../../core/services/demande.service';

@Component({
  selector: 'app-demandes-recues',
  standalone: true,
  imports: [
    CommonModule,
    HeaderPrestataireComponent
  ],
  templateUrl: './demandes-recues.html'
})
export class DemandesRecuesComponent implements OnInit {

  demandes: any[] = [];

  loading = true;

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

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.log('❌ ERROR:', err);

        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }

  accepter(d: any) {

    d.loading = true;

    this.demandeService
      .changerStatut(d.id, 'acceptee')
      .subscribe({

        next: () => {

          d.statut = 'acceptee';
          d.loading = false;

          this.cdr.detectChanges();
        },

        error: () => {
          d.loading = false;
        }

      });
  }

  refuser(d: any) {

    d.loading = true;

    this.demandeService
      .changerStatut(d.id, 'annulee')
      .subscribe({

        next: () => {

          d.statut = 'annulee';
          d.loading = false;

          this.cdr.detectChanges();
        },

        error: () => {
          d.loading = false;
        }

      });
  }

  terminer(d: any) {

    d.loading = true;

    this.demandeService
      .changerStatut(d.id, 'terminee')
      .subscribe({

        next: () => {

          d.statut = 'terminee';
          d.loading = false;

          this.cdr.detectChanges();
        },

        error: () => {
          d.loading = false;
        }

      });
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