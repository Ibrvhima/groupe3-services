import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-prestataires',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './prestataires.html',
})
export class PrestatairesComponent implements OnInit {
  prestatairesEnAttente: any[] = [];
  loading = true;
  message = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEnAttente();
  }

  loadEnAttente() {
    this.loading = true;
    this.adminService.getPrestatairesEnAttente().subscribe({
      next: (data: any) => {
        this.prestatairesEnAttente = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approuver(id: number) {
    this.adminService.approuverPrestataire(id).subscribe({
      next: () => {
        this.message = 'Prestataire approuvé avec succès !';
        this.loadEnAttente();
      },
      error: (err) => console.error(err)
    });
  }

  verifier(id: number) {
    this.adminService.verifierPrestataire(id).subscribe({
      next: () => {
        this.message = 'Prestataire vérifié avec succès !';
        this.loadEnAttente();
      },
      error: (err) => console.error(err)
    });
  }

  rejeter(id: number) {
    this.adminService.rejeterPrestataire(id).subscribe({
      next: () => {
        this.message = 'Prestataire rejeté.';
        this.loadEnAttente();
      },
      error: (err) => console.error(err)
    });
  }
}