import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Prestataire, Categorie } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

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

  // Emojis associés aux noms de catégories (insensible à la casse, fallback)
  readonly categoryEmojis: Record<string, string> = {
    'plombier':      '🔧',
    'électricien':   '⚡',
    'maçon':         '🧱',
    'menuisier':     '🪵',
    'peintre':       '🎨',
    'climatisation': '❄️',
    'jardinage':     '🌿',
    'jardinier':     '🌿',
    'nettoyage':     '🧹',
    'informatique':  '💻',
    'informaticien': '💻',
    'déménagement':  '🚚',
    'mécanicien':    '🔩',
  };

  /** Retourne l'emoji correspondant à une catégorie */
  getCategoryEmoji(nom: string): string {
    return this.categoryEmojis[nom.toLowerCase()] ?? '🛠️';
  }

  /** Couleur d'avatar basée sur le nom */
  avatarColor(p: Prestataire): string {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
    const idx = (p.user.nom?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx] ?? 'bg-orange-500';
  }

  /** Tableau [1..max] pour afficher les étoiles */
  etoilesArray(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** Route pour les catégories : client connecté → /client, sinon → /auth/register */
  get categorieRoute(): string {
    return this.auth.getRole() === 'client' ? '/client' : '/auth/register';
  }

  /** Lien vers le profil prestataire : client → détail, sinon → register */
  prestataireRoute(uuid: string): string[] {
    return this.auth.getRole() === 'client'
      ? ['/client/prestataire', uuid]
      : ['/auth/register'];
  }

  /** Lien "Voir tous les prestataires" */
  get tousPrestatairesRoute(): string {
    return this.auth.getRole() === 'client' ? '/client' : '/auth/register';
  }

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
        this.prestataires = list.slice(0, 3);
        this.loading      = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
