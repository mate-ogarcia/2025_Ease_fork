/**
 * @file comments.service.ts
 * @brief Angular service for interacting with the backend API to manage comments.
 *
 * This service provides methods to retrieve comments from the backend NestJS API
 * using `HttpClient`.
 */
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @class CommentsService
 * @brief Service responsible for handling API calls related to comments.
 *
 * This service interacts with the backend API to manage comment-related operations,
 * including retrieving and posting comments.
 */
@Injectable({
  providedIn: 'root',
})
export class Co2CalculatorService {
  // The base URL for the comments API.
  private _co2URL = `${environment.globalBackendUrl}/Co2Calculator`;

  /**
   * @constructor
   * @brief Initializes the CommentsService with the HttpClient for API requests.
   * @param {HttpClient} http - Angular HTTP client for making API requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * If the product is inside our DB then we can get its data with a join
   * but if its not then we need to send the necessary data to the backend
   * @param userLocation 
   * @param productId 
   * @param category 
   * @param origin 
   * @returns 
   */
  getCo2ImpactForProduct(userLocation: string, productId?: string, category?: string, origin?: string): Observable<any> {
    return this.http.get<any>(`${this._co2URL}/co2/${productId}/${userLocation}/${category}/${origin}`);
  }
}
