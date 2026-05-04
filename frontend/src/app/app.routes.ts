import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/client/home/home';
import { PrestataireDetailComponent } from './features/client/prestataire-detail/prestataire-detail';
import { DashboardComponent } from './features/admin/dashboard/dashboard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'client', component: HomeComponent },
  { path: 'client/prestataire/:id', component: PrestataireDetailComponent },
  { path: 'prestataire', component: LoginComponent },
  { path: 'admin', component: DashboardComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];