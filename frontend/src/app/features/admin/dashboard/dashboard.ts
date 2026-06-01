import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';
import { Categorie, Prestataire, User, Demande } from '../../../core/models';

interface Stats {
  users:        { total: number; clients: number; prestataires: number };
  prestataires: { total: number; disponibles: number; verifies: number };
  demandes:     { total: number; en_attente: number; acceptees: number; terminees: number; annulees: number };
  categories:   number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.html',
})
export class AdminDashboardComponent implements OnInit {

  onglet = 'stats';
  loading = true;

  readonly tabs = [
    { id: 'stats',        label: 'Statistiques' },
    { id: 'prestataires', label: 'Prestataires' },
    { id: 'clients',      label: 'Clients'      },
    { id: 'demandes',     label: 'Demandes'     },
    { id: 'categories',   label: 'Catégories'   },
  ];

  stats:        Stats | null  = null;
  prestataires: Prestataire[] = [];
  clients:      User[]        = [];
  demandes:     Demande[]     = [];
  categories:   Categorie[]   = [];

  newCat: Partial<Categorie> & { icone: string } = { nom: '', icone: '🔧', description: '' };
  catLoading = false;
  catError   = '';
  catSuccess = '';

  prestActionId: number | null = null;

  private api = environment.apiUrl;

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      stats:        this.adminService.getStats(),
      categories:   this.http.get<Categorie[]>(`${this.api}/categories/`),
      prestataires: this.adminService.getPrestataires(),
      clients:      this.adminService.getClients(),
      demandes:     this.adminService.getDemandes(),
    }).subscribe({
      next: ({ stats, categories, prestataires, clients, demandes }) => {
        this.stats        = stats;
        this.categories   = categories;
        this.prestataires = prestataires;
        this.clients      = clients;
        this.demandes     = demandes;
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-amber-50 text-amber-600',
      acceptee:   'bg-sky-50 text-sky-600',
      en_cours:   'bg-indigo-50 text-indigo-600',
      terminee:   'bg-emerald-50 text-emerald-600',
      refusee:    'bg-red-50 text-red-400',
      annulee:    'bg-slate-100 text-slate-500',
    };
    return map[statut] ?? 'bg-slate-100 text-slate-500';
  }

  statutPrestClass(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-amber-50 text-amber-600',
      approuve:   'bg-emerald-50 text-emerald-600',
      rejete:     'bg-red-50 text-red-400',
    };
    return map[statut] ?? 'bg-slate-100 text-slate-500';
  }

  setOnglet(o: string): void {
    this.onglet = o;
    this.cdr.detectChanges();
  }

  approuver(p: Prestataire): void {
    this.prestActionId = p.id;
    this.adminService.approuverPrestataire(p.id).subscribe({
      next: u => { this.prestataires = this.prestataires.map(x => x.id === u.id ? u : x); this.prestActionId = null; this.cdr.detectChanges(); },
      error: () => { this.prestActionId = null; this.cdr.detectChanges(); },
    });
  }

  rejeter(p: Prestataire): void {
    this.prestActionId = p.id;
    this.adminService.rejeterPrestataire(p.id).subscribe({
      next: u => { this.prestataires = this.prestataires.map(x => x.id === u.id ? u : x); this.prestActionId = null; this.cdr.detectChanges(); },
      error: () => { this.prestActionId = null; this.cdr.detectChanges(); },
    });
  }

  toggleBadge(p: Prestataire): void {
    this.prestActionId = p.id;
    this.adminService.updatePrestataire(p.id, { badge_verifie: !p.badge_verifie }).subscribe({
      next: u => { this.prestataires = this.prestataires.map(x => x.id === u.id ? u : x); this.prestActionId = null; this.cdr.detectChanges(); },
      error: () => { this.prestActionId = null; this.cdr.detectChanges(); },
    });
  }

  toggleDisponible(p: Prestataire): void {
    this.prestActionId = p.id;
    this.adminService.updatePrestataire(p.id, { disponible: !p.disponible }).subscribe({
      next: u => { this.prestataires = this.prestataires.map(x => x.id === u.id ? u : x); this.prestActionId = null; this.cdr.detectChanges(); },
      error: () => { this.prestActionId = null; this.cdr.detectChanges(); },
    });
  }

  supprimerUser(user: User, liste: 'prestataires' | 'clients'): void {
    if (!confirm(`Supprimer le compte de ${user.nom} ${user.prenom} ?`)) return;
    this.adminService.supprimerUser(user.id).subscribe({
      next: () => {
        if (liste === 'prestataires') this.prestataires = this.prestataires.filter(p => p.user.id !== user.id);
        else this.clients = this.clients.filter(c => c.id !== user.id);
        this.cdr.detectChanges();
      },
    });
  }

  ajouterCategorie(): void {
    if (!this.newCat.nom?.trim()) { this.catError = 'Le nom est obligatoire.'; return; }
    this.catLoading = true; this.catError = ''; this.catSuccess = '';
    this.http.post<Categorie>(`${this.api}/categories/`, this.newCat).subscribe({
      next: cat => {
        this.categories = [...this.categories, cat];
        this.newCat = { nom: '', icone: '🔧', description: '' };
        this.catSuccess = 'Catégorie ajoutée.'; this.catLoading = false; this.cdr.detectChanges();
      },
      error: err => { this.catError = err?.error?.nom?.[0] ?? 'Erreur.'; this.catLoading = false; this.cdr.detectChanges(); },
    });
  }

  supprimerCategorie(id: number): void {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.http.delete(`${this.api}/categories/${id}/`).subscribe({
      next: () => { this.categories = this.categories.filter(c => c.id !== id); this.cdr.detectChanges(); },
    });
  }

  pct(val: number, total: number): string {
    return total > 0 ? (val / total * 100).toFixed(1) + '%' : '0%';
  }

  clientAvatarClass(user: User): string {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
    const idx = (user.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-blue-500';
  }
}
