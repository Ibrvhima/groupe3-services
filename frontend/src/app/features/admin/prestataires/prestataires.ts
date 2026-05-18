import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminHeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-prestataires',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  templateUrl: './prestataires.html',
})
export class PrestatairesComponent implements OnInit {
  prestatairesEnAttente: any[] = [];
  loading = true;
  message = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading = true;
    this.adminService.getPrestatairesEnAttente().subscribe({
      next: (data) => { this.prestatairesEnAttente = data; this.loading = false; },
      error: (err: unknown) => { console.error(err); this.loading = false; },
    });
  }

  approuver(id: number) {
    this.adminService.approuverPrestataire(id).subscribe({
      next: () => { this.message = 'Prestataire approuvé.'; this.charger(); },
      error: (err: unknown) => console.error(err),
    });
  }

  rejeter(id: number) {
    this.adminService.rejeterPrestataire(id).subscribe({
      next: () => { this.message = 'Prestataire rejeté.'; this.charger(); },
      error: (err: unknown) => console.error(err),
    });
  }
}
