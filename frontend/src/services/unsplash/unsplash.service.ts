/**
 * @file api-unsplash.service.ts
 * @brief Service for interfacing with the backend Unsplash API.
 *
 * This Angular service provides a method to search for images by
 * communicating with the NestJS backend, which in turn queries Unsplash.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, retry } from 'rxjs';

export interface UnsplashResponse {
  imageUrl: string | null;
}

/**
 * @class APIUnsplash
 * @brief Handles API requests to retrieve images from Unsplash via the backend.
 *
 * This service calls the NestJS backend to fetch images from Unsplash,
 * ensuring the API key is not exposed on the frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class APIUnsplash {
  /** Base URL for the backend API handling Unsplash requests. */
  private _unsplash = environment.apiUnsplashUrl;

  /**
   * @brief Constructor that injects the HttpClient.
   * @param http HttpClient for making HTTP requests.
   */
  constructor(private http: HttpClient) {
  }

  /**
   * @brief Searches for photos on Unsplash via the backend.
   *
   * @param query The search term used to find images.
   * @returns An observable containing the image URL or null if not found.
   */
  searchPhotos(query: string): Observable<UnsplashResponse> {
    // Vérification du paramètre
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return of({ imageUrl: null });
    }

    // Nettoyage du terme de recherche
    const cleanQuery = query.trim();

    // Construction de l'URL
    const searchUrl = `${this._unsplash}/search?query=${encodeURIComponent(cleanQuery)}`;

    // Exécution de la requête avec retry et gestion d'erreur
    return this.http.get<UnsplashResponse>(searchUrl).pipe(
      retry(1), // Retry once in case of network issues
      catchError((error: HttpErrorResponse) => {
        // Return a fallback response
        return of({ imageUrl: null });
      })
    );
  }
}