import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AvisService {
  private apiUrl = `${environment.apiUrl}/avis`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
    return headers;
  }

  // Récupérer les avis de l'utilisateur connecté
  getMesAvis(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Donner un avis pour une demande
  donnerAvis(demandeId: number, note: number, commentaire?: string): Observable<any> {
    const body = {
      demande_id: demandeId,
      note: note,
      commentaire: commentaire || '',
    };
    return this.http.post(`${this.apiUrl}/donner-avis/`, body, { headers: this.getHeaders() });
  }

  // Récupérer un avis spécifique
  getAvisById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/`, { headers: this.getHeaders() });
  }
}
