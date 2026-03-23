import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'client', loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule) },
  { path: 'prestataire', loadChildren: () => import('./features/prestataire/prestataire.module').then(m => m.PrestataireModule) },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
