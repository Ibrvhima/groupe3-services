import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { HeaderComponent } from '../layout/header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  categories: any[] = [];
  prestataires: any[] = [];
  searchQuery = '';
  selectedCategorie = '';
  loading = false;

  constructor(
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPrestataires();
  }

  loadCategories() {
    this.prestataireService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  loadPrestataires(filters: any = {}) {
    this.loading = true;
    this.prestataireService.getAll(filters).subscribe({
      next: (data: any) => {
        this.prestataires = data.results ? data.results : Array.isArray(data) ? data : [];
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

  onSearch() {
    this.loadPrestataires({
      search: this.searchQuery,
      categorie: this.selectedCategorie,
    });
  }

  onSearchInput() {
    this.loadPrestataires({
      search: this.searchQuery,
      categorie: this.selectedCategorie,
    });
  }

  filterByCategorie(id: any) {
    this.selectedCategorie = this.selectedCategorie == id ? '' : id;
    this.loadPrestataires({
      categorie: this.selectedCategorie,
      search: this.searchQuery,
    });
  }

  getInitiales(nom: string, prenom: string): string {
    return (nom?.charAt(0) || '') + (prenom?.charAt(0) || '');
  }
}
