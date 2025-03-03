/**
 * @file api-unsplash.service.ts
 * @brief Service for interfacing with the backend Unsplash API.
 *
 * This Angular service provides a method to search for images by
 * communicating with the NestJS backend, which in turn queries Unsplash.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private _unsplash = environment.unsplashAccessKey;

  /**
   * @brief Constructor that injects the HttpClient.
   * @param http HttpClient for making HTTP requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @brief Searches for photos on Unsplash via the backend.
   *
   * @param query The search term used to find images.
   * @returns An observable containing the image URL or null if not found.
   */
  searchPhotos(query: string): Observable<{ imageUrl: string | null }> {
    return this.http.get<{ imageUrl: string | null }>(`${this._unsplash}/search?query=${query}`);
  }
}
