import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Devis, DevisCreate } from '../models';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private api = `${environment.apiUrl}/devis`;

  constructor(private http: HttpClient) {}

  /**
   * Prestataire : envoie un nouveau devis pour une demande.
   * Le backend vérifie que la demande appartient bien au prestataire connecté.
   */
  creerDevis(data: DevisCreate): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/`, data);
  }

  /**
   * Client : accepte un devis.
   * Le backend passe automatiquement la demande liée en statut "en_cours".
   */
  accepter(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/${id}/accepter/`, {});
  }

  /** Client : refuse un devis. */
  refuser(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/${id}/refuser/`, {});
  }
}
