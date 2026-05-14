import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Prestataire, Categorie } from '../../core/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
})
export class LandingComponent implements OnInit {

  categories:   Categorie[]   = [];
  prestataires: Prestataire[] = [];
  loading     = true;
  currentYear = new Date().getFullYear();

  // Images Unsplash associées aux noms de catégories (insensible à la casse)
  readonly categoryImages: Record<string, string> = {
    'plomberie':    'https://images.unsplash.com/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=600&q=80',
    'plombier':     'https://images.unsplash.com/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=600&q=80',
    'électricité':  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    'électricien':  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    'peinture':     'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    'peintre':      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    'maçonnerie':   'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    'maçon':        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    'menuiserie':   'https://images.unsplash.com/photo-1659930087003-2d64e33181f7?auto=format&fit=crop&w=600&q=80',
    'menuisier':    'https://images.unsplash.com/photo-1659930087003-2d64e33181f7?auto=format&fit=crop&w=600&q=80',
    'nettoyage':    'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80',
    'climatisation':'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  };

  /** Retourne l'image correspondant à une catégorie, ou une image générique */
  getCategoryImage(nom: string): string {
    const key = nom.toLowerCase();
    return this.categoryImages[key]
      ?? 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80';
  }

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Charge les catégories et les meilleurs prestataires en parallèle
    this.http.get<Categorie[]>(`${this.api}/categories/`).subscribe({
      next: cats => this.categories = cats,
    });

    // Les 6 meilleurs prestataires approuvés triés par note
    this.http.get<any>(`${this.api}/prestataires/?ordering=-note_moyenne`).subscribe({
      next: res => {
        // Gère les deux formats : liste directe ou paginée
        const list       = res.results ?? res;
        this.prestataires = list.slice(0, 6);
        this.loading      = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
