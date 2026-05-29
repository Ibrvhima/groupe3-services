import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PrestataireService } from '../../../core/services/prestataire.service';
import { HeaderComponent } from '../layout/header/header';
import { Prestataire, Categorie } from '../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  categories:   Categorie[]   = [];
  prestataires: Prestataire[] = [];
  searchQuery       = '';
  selectedCategorie = '';
  loading           = false;

  private searchSubject = new Subject<{ search: string; categorie: string }>();
  private searchSub!:   Subscription;

  constructor(
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged((a, b) => a.search === b.search && a.categorie === b.categorie),
    ).subscribe(filters => this.loadPrestataires(filters));

    this.loadCategories();
    this.loadPrestataires();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadCategories() {
    this.prestataireService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
    });
  }

  loadPrestataires(filters: { search?: string; categorie?: string } = {}) {
    this.loading = true;
    this.prestataireService.getAll(filters).subscribe({
      next: (data: any) => {
        this.prestataires = data.results ?? (Array.isArray(data) ? data : []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearchInput() {
    this.searchSubject.next({ search: this.searchQuery, categorie: this.selectedCategorie });
  }

  onSearch() {
    this.loadPrestataires({ search: this.searchQuery, categorie: this.selectedCategorie });
  }

  filterByCategorie(id: number | string) {
    const idStr = id === '' ? '' : String(id);
    this.selectedCategorie = this.selectedCategorie === idStr ? '' : idStr;
    this.loadPrestataires({ categorie: this.selectedCategorie, search: this.searchQuery });
  }

  getInitiales(nom?: string, prenom?: string): string {
    return (nom?.charAt(0) ?? '') + (prenom?.charAt(0) ?? '');
  }
}
