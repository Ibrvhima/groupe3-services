import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categorie, Prestataire, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PrestataireService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Liste paginée avec filtres optionnels (search, categorie, quartier). */
  getAll(filters: Record<string, string> = {}): Observable<PaginatedResponse<Prestataire>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<PaginatedResponse<Prestataire>>(`${this.api}/prestataires/`, { params });
  }

  getByUuid(uuid: string): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.api}/prestataires/${uuid}/`);
  }

  /** Retourne le profil prestataire de l'utilisateur connecté. */
  getMonProfil(): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.api}/prestataires/me/`);
  }

  /** Liste des catégories — pas de pagination, toujours complète. */
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.api}/categories/`);
  }

  updateProfil(uuid: string, data: Partial<Prestataire>): Observable<Prestataire> {
    return this.http.patch<Prestataire>(`${this.api}/prestataires/${uuid}/`, data);
  }

  /**
   * Met à jour le profil avec photo.
   * Utilise FormData car l'envoi d'un fichier nécessite multipart/form-data.
   */
  updateProfilAvecPhoto(uuid: string, data: FormData): Observable<Prestataire> {
    return this.http.patch<Prestataire>(`${this.api}/prestataires/${uuid}/`, data);
  }
}
