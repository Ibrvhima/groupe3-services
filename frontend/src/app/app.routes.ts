import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/client/home/home';
import { PrestataireDetailComponent } from './features/client/prestataire-detail/prestataire-detail';
import { DemandeFormComponent } from './features/client/demande-form/demande-form';
import { MesDemandes } from './features/client/mes-demandes/mes-demandes';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { PrestatairesComponent } from './features/admin/prestataires/prestataires';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'client', component: HomeComponent },
  { path: 'client/prestataire/:id', component: PrestataireDetailComponent },
  { path: 'client/demande/:id', component: DemandeFormComponent },
  { path: 'client/mes-demandes', component: MesDemandes },
  { path: 'client/demandes', redirectTo: 'client/mes-demandes', pathMatch: 'full' },
  { path: 'prestataire', component: LoginComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'admin/prestataires', component: PrestatairesComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
];
