import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Demande, DemandeCreate, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private api = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) {}

  /**
   * Retourne les demandes de l'utilisateur connecté.
   * - Client      → ses demandes envoyées
   * - Prestataire → ses demandes reçues
   * Le backend filtre selon le rôle JWT.
   */
  getMesDemandes(): Observable<PaginatedResponse<Demande>> {
    return this.http.get<PaginatedResponse<Demande>>(`${this.api}/`);
  }

  creerDemande(data: DemandeCreate): Observable<Demande> {
    return this.http.post<Demande>(`${this.api}/`, data);
  }

  accepter(id: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.api}/${id}/accepter/`, {});
  }

  refuser(id: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.api}/${id}/refuser/`, {});
  }

  terminer(id: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.api}/${id}/terminer/`, {});
  }

  annuler(id: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.api}/${id}/annuler/`, {});
  }

  getStats(): Observable<{ en_attente: number; acceptees: number; terminees: number; total: number }> {
    return this.http.get<any>(`${this.api}/stats/`);
  }
}
