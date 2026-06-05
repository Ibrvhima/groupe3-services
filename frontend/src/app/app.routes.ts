import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Page d'accueil publique (landing) — aucune authentification requise
  {
    path: '',
    title: 'DouraKa — Trouvez un prestataire à Conakry',
    loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent),
  },

  // auth
  {
    path: 'auth/login',
    title: 'Connexion',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    title: 'Inscription',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/forgot-password',
    title: 'Mot de passe oublié',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    title: 'Nouveau mot de passe',
    loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent),
  },

  // espace client
  {
    path: 'client',
    canActivate: [roleGuard('client')],
    children: [
      {
        path: '',
        title: 'Trouver un prestataire',
        loadComponent: () => import('./features/client/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'prestataire/:uuid',
        title: 'Profil prestataire',
        loadComponent: () => import('./features/client/prestataire-detail/prestataire-detail').then(m => m.PrestataireDetailComponent),
      },
      {
        path: 'demander/:uuid',
        title: 'Faire une demande',
        loadComponent: () => import('./features/client/demande-form/demande-form').then(m => m.DemandeFormComponent),
      },
      {
        path: 'mes-demandes',
        title: 'Mes demandes',
        loadComponent: () => import('./features/client/mes-demandes/mes-demandes').then(m => m.MesDemandesComponent),
      },
      {
        path: 'chat',
        title: 'Messages',
        loadComponent: () => import('./features/client/chat/chat').then(m => m.ChatClientComponent),
      },
      {
        path: 'profil',
        title: 'Mon profil',
        loadComponent: () => import('./features/client/profil/profil').then(m => m.ClientProfilComponent),
      },
    ],
  },

  // espace prestataire
  {
    path: 'prestataire',
    canActivate: [roleGuard('prestataire')],
    children: [
      {
        path: '',
        title: 'Tableau de bord',
        loadComponent: () => import('./features/prestataire/home/home').then(m => m.PrestataireHomeComponent),
      },
      {
        path: 'demandes',
        title: 'Mes demandes reçues',
        loadComponent: () => import('./features/prestataire/demandes/demandes').then(m => m.PrestataireDemandesComponent),
      },
      {
        path: 'profil',
        title: 'Mon profil',
        loadComponent: () => import('./features/prestataire/profil/profil').then(m => m.PrestataireProfilComponent),
      },
      {
        path: 'chat',
        title: 'Messages',
        loadComponent: () => import('./features/prestataire/chat/chat').then(m => m.ChatPrestataireComponent),
      },
    ],
  },

  // espace admin
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    children: [
      {
        path: '',
        title: 'Administration',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'prestataires',
        title: 'Gestion des prestataires',
        loadComponent: () => import('./features/admin/prestataires/prestataires').then(m => m.PrestatairesComponent),
      },
      {
        path: 'utilisateurs',
        redirectTo: '',
      },
      {
        path: 'signalements',
        redirectTo: '',
      },
    ],
  },

  // fallback 404
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFoundComponent),
  },
];
