import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getStats() {
    return this.http.get(`${this.api}/admin/stats/`, this.getHeaders());
  }


  getPrestatairesEnAttente() {
  return this.http.get(`http://localhost:8000/api/prestataires/en-attente/`, this.getHeaders());
}

approuverPrestataire(id: number) {
  return this.http.patch(`http://localhost:8000/api/prestataires/${id}/approuver/`, {}, this.getHeaders());
}

rejeterPrestataire(id: number) {
  return this.http.patch(`http://localhost:8000/api/prestataires/${id}/rejeter/`, {}, this.getHeaders());
}


verifierPrestataire(id: number) {
  return this.http.patch(`http://localhost:8000/api/prestataires/${id}/verifier/`, {}, this.getHeaders());
}
}

