import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DemandeService {

  private api = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // =========================
  // ✅ CLIENT
  // =========================

  creer(data: any) {
    return this.http.post(`${this.api}/demandes/`, data);
  }

  getMesDemandes() {
    return this.http.get(`${this.api}/demandes/mes-demandes/`);
  }

  annuler(id: number) {
    return this.http.patch(`${this.api}/demandes/${id}/statut/`, {
      statut: 'annulee'
    });
  }

  // =========================
  // ✅ PRESTATAIRE
  // =========================

  getDemandesPrestataire() {
    return this.http.get(`${this.api}/prestataire/demandes/`);
  }

  changerStatut(id: number, statut: string) {
    return this.http.patch(`${this.api}/demandes/${id}/statut/`, { statut });
  }
}