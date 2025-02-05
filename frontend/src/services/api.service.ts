/**
 * @brief Service Angular pour interagir avec l'API backend.
 * 
 * Ce service permet d'effectuer des requêtes HTTP pour récupérer et envoyer des données
 * au backend NestJS via `HttpClient`.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/data';  // URL du backend

  constructor(private http: HttpClient) {}

  /**
   * @brief Récupère les données depuis le backend via une requête HTTP GET.
   * 
   * Cette méthode interroge l'API backend (`GET /data`) pour obtenir les données 
   * stockées. Elle retourne un `Observable` contenant la réponse.
   * 
   * @returns {Observable<any[]>} Un `Observable` contenant les données du backend.
   */
  getData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * @brief Envoie des données au backend via une requête HTTP POST.
   * 
   * Cette méthode envoie un `payload` au backend (`POST /data`). Elle retourne 
   * un `Observable` contenant la réponse du serveur.
   * 
   * @param {any} payload - Les données à envoyer au backend.
   * @returns {Observable<any>} Un `Observable` contenant la réponse du serveur.
   */
  sendData(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
