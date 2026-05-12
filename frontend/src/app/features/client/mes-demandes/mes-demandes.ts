import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { HeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './mes-demandes.html',
  styleUrl: './mes-demandes.css',
})
export class MesDemandes implements OnInit {
  demandes: any[] = [];
  loading = true;
  statusColors: any = {
    en_attente: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'En attente' },
    acceptee: { bg: 'bg-green-50', text: 'text-green-600', label: 'Acceptée' },
    terminee: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Terminée' },
    annulee: { bg: 'bg-red-50', text: 'text-red-600', label: 'Annulée' },
  };

  constructor(
    private demandeService: DemandeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.loading = true;
    this.demandeService.getMesDemandes().subscribe({
      next: (data: any) => {
        this.demandes = Array.isArray(data) ? data : data.results || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusColor(statut: string) {
    return this.statusColors[statut] || this.statusColors['en_attente'];
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }
}
