// unsplash.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnsplashService {
  private apiUrl = 'https://api.unsplash.com/search/photos';
  private accessKey = environment.unsplashAccessKey;

  constructor(private http: HttpClient) { }

  // Recherche d'images par mot-clé
  searchPhotos(query: string): Observable<any> {
    const url = `${this.apiUrl}?query=${encodeURIComponent(query)}&client_id=${this.accessKey}`;
    return this.http.get(url);
  }
}
