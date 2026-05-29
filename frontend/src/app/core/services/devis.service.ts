import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Devis, DevisCreate } from '../models';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private api = `${environment.apiUrl}/devis`;

  constructor(private http: HttpClient) {}

  creerDevis(data: DevisCreate): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/`, data);
  }

  accepter(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/${id}/accepter/`, {});
  }

  refuser(id: number): Observable<Devis> {
    return this.http.post<Devis>(`${this.api}/${id}/refuser/`, {});
  }
}
