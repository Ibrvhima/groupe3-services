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
  quartierFiltre    = '';
  noteMinimale      = 0;
  loading           = false;

  readonly quartiers = ['Tous les quartiers', 'Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Lambanyi', 'Cosa'];

  private searchSubject = new Subject<void>();
  private searchSub!:   Subscription;

  constructor(
    private prestataireService: PrestataireService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
    ).subscribe(() => this.loadPrestataires());

    this.loadCategories();
    this.loadPrestataires();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadCategories(): void {
    this.prestataireService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
    });
  }

  loadPrestataires(): void {
    this.loading = true;
    const filters: any = {};
    if (this.searchQuery.trim())     filters['search']    = this.searchQuery.trim();
    if (this.selectedCategorie)      filters['categorie'] = this.selectedCategorie;
    if (this.quartierFiltre)         filters['quartier']  = this.quartierFiltre;

    this.prestataireService.getAll(filters).subscribe({
      next: (data: any) => {
        let list: Prestataire[] = data.results ?? (Array.isArray(data) ? data : []);
        if (this.noteMinimale > 0) {
          list = list.filter(p => +(p.note_moyenne ?? 0) >= this.noteMinimale);
        }
        this.prestataires = list;
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchInput(): void { this.searchSubject.next(); }

  onSearch(): void { this.loadPrestataires(); }

  toggleCategorie(id: number | string): void {
    const idStr = id === '' ? '' : String(id);
    this.selectedCategorie = this.selectedCategorie === idStr ? '' : idStr;
    this.loadPrestataires();
  }

  setNote(n: number): void {
    this.noteMinimale = this.noteMinimale === n ? 0 : n;
    this.loadPrestataires();
  }

  onQuartierChange(): void { this.loadPrestataires(); }

  stars(note: string | number | null): boolean[] {
    const n = Math.round(+(note ?? 0));
    return [1, 2, 3, 4, 5].map(i => i <= n);
  }

  getInitiales(nom?: string, prenom?: string): string {
    return ((nom?.charAt(0) ?? '') + (prenom?.charAt(0) ?? '')).toUpperCase();
  }

  avatarClass(p: Prestataire): string {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
    const idx = (p.user?.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-orange-500';
  }
}
