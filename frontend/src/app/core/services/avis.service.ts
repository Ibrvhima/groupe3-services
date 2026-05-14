import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AvisCreate {
  demande:     number;
  note:        number;   // 1 à 5
  commentaire: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private api = `${environment.apiUrl}/avis`;

  constructor(private http: HttpClient) {}

  creerAvis(data: AvisCreate): Observable<any> {
    return this.http.post(`${this.api}/`, data);
  }

  getAvisPrestataire(prestataireId: number): Observable<any> {
    return this.http.get(`${this.api}/?prestataire=${prestataireId}`);
  }
}
