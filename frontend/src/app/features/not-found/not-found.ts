import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div class="text-7xl mb-4">🔍</div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Page introuvable</h1>
      <p class="text-sm text-gray-500 mb-6">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <a [routerLink]="homeLink"
         class="bg-amber-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition">
        Retour à l'accueil
      </a>
    </div>
  `,
})
export class NotFoundComponent {
  homeLink: string;

  constructor(auth: AuthService) {
    const role = auth.getRole();
    this.homeLink = role ? `/${role}` : '/auth/login';
  }
}
