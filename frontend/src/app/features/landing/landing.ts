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
    'plombier':      'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=600',
    'électricien':   'https://images.pexels.com/photos/9679179/pexels-photo-9679179.jpeg?auto=compress&cs=tinysrgb&w=600',
    'mécanicien':    'https://images.pexels.com/photos/5276374/pexels-photo-5276374.jpeg?auto=compress&cs=tinysrgb&w=600',
    'peintre':       'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&w=600',
    'maçon':         'https://images.pexels.com/photos/11236546/pexels-photo-11236546.jpeg?auto=compress&cs=tinysrgb&w=600',
    'menuisier':     'https://images.pexels.com/photos/5973931/pexels-photo-5973931.jpeg?auto=compress&cs=tinysrgb&w=600',
    'climatisation': 'https://images.pexels.com/photos/13061307/pexels-photo-13061307.jpeg?auto=compress&cs=tinysrgb&w=600',
    'jardinier':     'https://images.pexels.com/photos/6231862/pexels-photo-6231862.jpeg?auto=compress&cs=tinysrgb&w=600',
    'informaticien': 'https://images.pexels.com/photos/6754846/pexels-photo-6754846.jpeg?auto=compress&cs=tinysrgb&w=600',
    'couturier':     'https://images.pexels.com/photos/19188184/pexels-photo-19188184.jpeg?auto=compress&cs=tinysrgb&w=600',
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
