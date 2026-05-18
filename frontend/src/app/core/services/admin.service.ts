import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prestataire, User, Demande } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/admin/stats/`);
  }

  getPrestataires(): Observable<Prestataire[]> {
    return this.http.get<Prestataire[]>(`${this.api}/admin/prestataires/`);
  }

  getPrestatairesEnAttente(): Observable<Prestataire[]> {
    return this.http.get<Prestataire[]>(`${this.api}/admin/prestataires/?approuve=false`);
  }

  updatePrestataire(id: number, data: Partial<Prestataire>): Observable<Prestataire> {
    return this.http.patch<Prestataire>(`${this.api}/admin/prestataires/${id}/`, data);
  }

  approuverPrestataire(id: number): Observable<Prestataire> {
    return this.updatePrestataire(id, { approuve: true, statut: 'approuve' });
  }

  rejeterPrestataire(id: number): Observable<Prestataire> {
    return this.updatePrestataire(id, { approuve: false, statut: 'rejete' });
  }

  getClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/admin/clients/`);
  }

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.api}/admin/demandes/`);
  }

  supprimerUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/users/${id}/`);
  }
}
