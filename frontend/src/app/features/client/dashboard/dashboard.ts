import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PrestataireService } from '../../../core/services/prestataire.service';

import { HeaderClientComponent } from '../layout/header-client/header-client';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderClientComponent
  ],
  templateUrl: './dashboard.html',
})
export class ClientDashboardComponent implements OnInit {

  // =========================
  // DATA
  // =========================

  prestataires: any[] = [];
  allPrestataires: any[] = [];
  categories: any[] = [];

  // =========================
  // UI
  // =========================

  loading = true;

  searchQuery = '';
  selectedCategorie = '';

  constructor(
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // =========================
  // LOAD DATA
  // =========================

  loadData() {

    this.loading = true;

    // =========================
    // PRESTATAIRES
    // =========================

    this.prestataireService.getPrestataires().subscribe({
      next: (data: any) => {

        this.allPrestataires = Array.isArray(data)
          ? data
          : data.results || [];

        this.prestataires = [...this.allPrestataires];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.cdr.detectChanges();
      }
    });

    // =========================
    // CATÉGORIES
    // =========================

    this.prestataireService.getCategories().subscribe({
      next: (data: any) => {

        this.categories = Array.isArray(data)
          ? data
          : data.results || [];

        this.cdr.detectChanges();
      },

      error: (err) => console.log(err)
    });
  }

  // =========================
  // SEARCH
  // =========================

  onSearchInput() {

    const query = this.searchQuery.toLowerCase().trim();

    this.prestataires = this.allPrestataires.filter((p: any) => {

      const fullName =
        `${p.user?.nom || ''} ${p.user?.prenom || ''}`.toLowerCase();

      const categorie =
        p.categorie?.nom?.toLowerCase() || '';

      const quartier =
        p.quartier?.toLowerCase() || '';

      const matchSearch =
        fullName.includes(query) ||
        categorie.includes(query) ||
        quartier.includes(query);

      const matchCategorie =
        !this.selectedCategorie ||
        p.categorie?.id == this.selectedCategorie;

      return matchSearch && matchCategorie;
    });

    this.cdr.detectChanges();
  }

  // =========================
  // FILTER
  // =========================

  filterByCategorie(id: any) {

    this.selectedCategorie = id;

    this.onSearchInput();
  }

  // =========================
  // HELPERS
  // =========================

  getInitiales(nom: string, prenom: string): string {

    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`;
  }
}