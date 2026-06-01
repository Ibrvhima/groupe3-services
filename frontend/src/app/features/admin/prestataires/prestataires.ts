import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { Prestataire } from '../../../core/models';

@Component({
  selector: 'app-prestataires',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './prestataires.html',
})
export class PrestatairesComponent implements OnInit {
  prestataires: Prestataire[] = [];
  loading       = true;
  actionLoading: number | null = null;
  filtreActif   = 'en_attente';

  readonly filtres = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'approuve',   label: 'Approuvés'  },
    { key: 'rejete',     label: 'Rejetés'    },
  ];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.loading = true;
    this.adminService.getPrestataires().subscribe({
      next: data => {
        this.prestataires = data;
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get prestaFiltres(): Prestataire[] {
    return this.prestataires.filter(p => p.statut === this.filtreActif);
  }

  count(key: string): number {
    return this.prestataires.filter(p => p.statut === key).length;
  }

  approuver(p: Prestataire): void {
    this.actionLoading = p.id;
    this.adminService.approuverPrestataire(p.id).subscribe({
      next: updated => {
        this.prestataires = this.prestataires.map(x => x.id === updated.id ? updated : x);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  rejeter(p: Prestataire): void {
    this.actionLoading = p.id;
    this.adminService.rejeterPrestataire(p.id).subscribe({
      next: updated => {
        this.prestataires = this.prestataires.map(x => x.id === updated.id ? updated : x);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  toggleBadge(p: Prestataire): void {
    this.actionLoading = p.id;
    this.adminService.updatePrestataire(p.id, { badge_verifie: !p.badge_verifie }).subscribe({
      next: updated => {
        this.prestataires = this.prestataires.map(x => x.id === updated.id ? updated : x);
        this.actionLoading = null;
        this.cdr.detectChanges();
      },
      error: () => { this.actionLoading = null; this.cdr.detectChanges(); },
    });
  }

  avatarClass(p: Prestataire): string {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
    const idx = (p.user?.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-orange-500';
  }
}
