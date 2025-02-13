/**
 * @file api.service.ts
 * @brief Angular service for interacting with the backend API.
 *
 * This service provides methods to make HTTP requests to the backend NestJS API
 * using `HttpClient` to retrieve and send data.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _backendUrl = environment.backendUrl;
  private _searchUrl = environment.searchUrl;
  private _productsUrl = environment.productsURL;

  constructor(private http: HttpClient) {}

  /**
   * @brief Retrieves data from the backend using an HTTP GET request.
   *
   * This method calls the backend API (`GET /data`) to fetch stored data.
   * Returns an `Observable` containing the response.
   *
   * @returns {Observable<any[]>} An `Observable` containing backend data.
   */
  getData(): Observable<any[]> {
    return this.http.get<any[]>(this._backendUrl);
  }

  /**
   * @brief Performs a product search on the backend using an HTTP GET request.
   *
   * @param {string} query - The search term entered by the user.
   * @returns {Observable<any[]>} An `Observable` containing the search results.
   */
  searchProducts(query: string): Observable<any[]> {
    console.log('🔹 Sending search request:', `${this._searchUrl}?q=${query}`);

    return this.http.get<any[]>(`${this._searchUrl}?q=${query}`).pipe(
      tap((response) => console.log('🔹 API Response:', response)), // <== Ajout du log pour voir la réponse
      catchError((error) => {
        console.error('❌ Search API Error:', error);
        return throwError(
          () => new Error("Erreur API : Impossible d'effectuer la recherche.")
        );
      })
    );
  }

  /**
   * @brief Sends data to the backend using an HTTP POST request.
   *
   * This method sends a `payload` to the backend (`POST /data`). It returns
   * an `Observable` containing the server response.
   *
   * @param {any} payload - The data to be sent to the backend.
   * @returns {Observable<any>} An `Observable` containing the server response.
   */
  sendData(payload: any): Observable<any> {
    return this.http.post<any>(this._backendUrl, payload);
  }

  /**
   * @brief Sends search data to the backend via an HTTP POST request.
   *
   * This method sends a `payload` to the backend search endpoint (`POST`).
   * It returns an `Observable` containing the server response.
   *
   * @param {any} payload - The search data to send to the backend.
   * @returns {Observable<any>} An `Observable` containing the server response.
   */
  sendSearchData(payload: any): Observable<any> {
    return this.http.post<any>(this._searchUrl, payload);
  }

  /**
   * @brief Sends a selected product ID to the backend via an HTTP POST request.
   *
   * This method posts the selected product's ID to the backend for processing.
   *
   * @param {object} data - The object containing the product ID.
   * @returns {Observable<any>} An `Observable` containing the server response.
   */
  postProductSelection(data: { productId: string }) {
    return this.http.post(`${this._productsUrl}/select`, data);
  }

  /**
   * @brief Retrieves product details by ID using an HTTP GET request.
   *
   * This method calls the backend API to fetch details of a specific product
   * based on the provided product ID.
   *
   * @param {string} id - The ID of the product to fetch.
   * @returns {Observable<any>} An `Observable` containing the product details.
   */
  getProductById(id: string): Observable<any> {
    console.log(
      '🔹 Fetching product by ID from:',
      `${this._productsUrl}/${id}`
    );
    return this.http.get<any[]>(`${this._productsUrl}/${id}`);
  }

  /**
   * Retrieves all alternative products for the selected one.
   * @param {string} id - ID of the selected product
   */
  getAlternativeProducts(id: string): Observable<any> {
    console.log(
      '🔹 Fetching alternative products from:',
      `${this._productsUrl}/alternativeProducts/${id}`
    );
    return this.http
      .get<any[]>(`${this._productsUrl}/alternativeProducts/${id}`)
      .pipe(
        catchError((error) => {
          console.error('❌ API Error:', error);
          return throwError(
            () =>
              new Error(
                'Erreur API : Impossible de récupérer les produits alternatifs.'
              )
          );
        })
      );
  }
}
