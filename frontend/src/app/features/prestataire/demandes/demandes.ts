import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeService } from '../../../core/services/demande.service';
import { PrestataireHeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-prestataire-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule, PrestataireHeaderComponent],
  templateUrl: './demandes.html',
})
export class PrestataireDemandesComponent implements OnInit {
  demandes: any[] = [];
  loading = true;
  actionLoading: number | null = null;
  activeTab = 'en_attente';

  constructor(private demandeService: DemandeService) {}

  ngOnInit() { this.charger(); }

  charger() {
    this.loading = true;
    this.demandeService.getMesDemandes().subscribe({
      next: (data: any) => {
        this.demandes = Array.isArray(data) ? data : (data.results ?? []);
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get demandesFiltrees(): any[] {
    if (this.activeTab === 'en_attente')  return this.demandes.filter(d => d.statut === 'en_attente');
    if (this.activeTab === 'en_cours')    return this.demandes.filter(d => ['acceptee','en_cours'].includes(d.statut));
    return this.demandes.filter(d => ['terminee','refusee','annulee'].includes(d.statut));
  }

  accepter(id: number) { this._action(id, () => this.demandeService.accepter(id)); }
  refuser(id: number)  { this._action(id, () => this.demandeService.refuser(id)); }
  terminer(id: number) { this._action(id, () => this.demandeService.terminer(id)); }

  private _action(id: number, call: () => any) {
    this.actionLoading = id;
    call().subscribe({
      next: (updated: any) => {
        this.demandes      = this.demandes.map(d => d.id === id ? updated : d);
        this.actionLoading = null;
      },
      error: () => { this.actionLoading = null; }
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-700',
      acceptee:   'bg-blue-100 text-blue-700',
      refusee:    'bg-red-100 text-red-600',
      en_cours:   'bg-blue-100 text-blue-700',
      terminee:   'bg-green-100 text-green-700',
      annulee:    'bg-gray-100 text-gray-500',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-500';
  }
}
