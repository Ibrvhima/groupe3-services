import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'client', component: LoginComponent },       // temporaire
  { path: 'prestataire', component: LoginComponent },  // temporaire
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];