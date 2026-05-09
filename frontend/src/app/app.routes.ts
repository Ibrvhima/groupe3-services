import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ClientDashboardComponent} from './features/client/dashboard/dashboard';
import { DemandeService } from './core/services/demande.service';
import { DemandeFormComponent } from './features/client/demande-form/demande-form';


export const routes: Routes = [
  // AUTH
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // CLIENT
  {
    path: 'client',
    children: [
      {
        path: '',
        component: ClientDashboardComponent
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/client/dashboard/dashboard')
            .then(m => m.ClientDashboardComponent)
      },
      {
        path: 'prestataire/:id',
        loadComponent: () =>
          import('./features/client/prestataire-detail/prestataire-detail')
            .then(m => m.PrestataireDetailComponent)
      },
      {
        path: 'demande-form/:id',
        loadComponent: () =>
          import('./features/client/demande-form/demande-form')
            .then(m => m.DemandeFormComponent)
      },
      {
        path: 'demandes',
        loadComponent: () =>
          import('./features/client/demandes/demandes')
            .then(m => m.DemandesComponent)
      }
    ]
  },

  // PRESTATAIRE
  {
    path: 'prestataire',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/prestataire/layout/header-prestataire/header-prestataire')
            .then(m => m.HeaderPrestataireComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/prestataire/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'demandes-recues',
        loadComponent: () =>
          import('./features/prestataire/demandes-recues/demandes-recues')
            .then(m => m.DemandesRecuesComponent)
      }
    ]
  },

  // DEFAULT
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];