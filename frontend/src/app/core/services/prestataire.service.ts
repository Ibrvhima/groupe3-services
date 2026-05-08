import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PrestataireService {
  private api = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getAll(filters: any = {}) {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => {
      if (filters[k]) params = params.set(k, filters[k]);
    });
    return this.http.get(`${this.api}/prestataires/`, { params, ...this.getHeaders() });
  }

  getById(id: number) {
    return this.http.get(`${this.api}/prestataires/${id}/`, this.getHeaders());
  }

  getCategories() {
    return this.http.get(`${this.api}/categories/`);
  }
}