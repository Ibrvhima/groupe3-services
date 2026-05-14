import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  getAll() {
    return this.http.get(`${this.api}/demandes/`, this.getHeaders());
  }

  getMesDemandes() {
    return this.http.get(`${this.api}/demandes/`, this.getHeaders());
  }

  creer(data: any) {
    return this.http.post(`${this.api}/demandes/`, data, this.getHeaders());
  }

  changerStatut(id: number, statut: string) {
    return this.http.patch(
      `${this.api}/demandes/${id}/changer_statut/`,
      { statut },
      this.getHeaders(),
    );
  }
}
