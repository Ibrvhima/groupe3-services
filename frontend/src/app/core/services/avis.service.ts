import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AvisCreate {
  demande:     number;
  note:        number;
  commentaire: string;
}

export interface Avis {
  id:           number;
  demande:      number;
  client:       number;
  prestataire:  number;
  note:         number;
  commentaire:  string;
  date:         string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private api = `${environment.apiUrl}/avis`;

  constructor(private http: HttpClient) {}

  creerAvis(data: AvisCreate): Observable<Avis> {
    return this.http.post<Avis>(`${this.api}/`, data);
  }

  getAvisPrestataire(prestataireId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.api}/?prestataire=${prestataireId}`);
  }
}
