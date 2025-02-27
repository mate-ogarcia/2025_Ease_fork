/**
 * @file data-cache.service.ts
 * @brief Service for caching and retrieving application data.
 * 
 * This service fetches and caches data such as countries, categories, and brands 
 * from the backend API to optimize performance and reduce redundant API calls.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root', // Ensures the service is a singleton
})
export class DataCacheService {
  //  BehaviorSubject<T> : Allows components to access the latest value at any time.
  private countries$ = new BehaviorSubject<string[]>([]);   // Stores the cached list of European countries
  private categories$ = new BehaviorSubject<any[]>([]);     // Stores the cached list of product categories
  private brands$ = new BehaviorSubject<any[]>([]);         // Stores the cached list of brands

  private isLoaded = false; // Flag to prevent redundant data loading
  private apiCountriesUrl = environment.apiCountrieUrl;     // Backend API endpoint for fetching European countries

  /**
   * @brief Constructor initializes the HTTP client and API service.
   * @param http Service for making HTTP requests.
   * @param apiService Service for fetching product-related data from the backend.
   */
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) { }

  /**
   * @brief Loads all necessary data (countries, categories, brands) only once.
   * 
   * This function ensures that the data is fetched only once and stored in a cache.
   */
  loadData(): void {
    if (this.isLoaded) return;
    this.isLoaded = true;

    // Load countries from the backend NestJS API
    this.http.get<string[]>(this.apiCountriesUrl).pipe(
      tap(countries => this.countries$.next(countries))
    ).subscribe({
      error: (error) => console.error('❌ Error fetching countries:', error)
    });

    // Load product categories from the backend API
    this.apiService.getAllCategories().pipe(
      tap(categories => this.categories$.next(categories.sort()))
    ).subscribe({
      error: (error) => console.error('❌ Error fetching categories:', error)
    });

    // Load brands from the backend API
    this.apiService.getAllBrands().pipe(
      tap(brands => this.brands$.next(brands.sort()))
    ).subscribe({
      error: (error) => console.error('❌ Error fetching brands:', error)
    });
  }

  /**
   * @brief Returns the cached list of European countries.
   * @return Observable<string[]> List of European countries.
   */
  getCountries(): Observable<string[]> {
    return this.countries$.asObservable();
  }

  /**
   * @brief Returns the cached list of product categories.
   * @return Observable<any[]> List of product categories.
   */
  getCategories(): Observable<any[]> {
    return this.categories$.asObservable();
  }

  /**
   * @brief Returns the cached list of brands.
   * @return Observable<any[]> List of brands.
   */
  getBrands(): Observable<any[]> {
    return this.brands$.asObservable();
  }

  /**
   * @brief Checks if a given country is European using the cached data.
   * @param origin The name of the country to check.
   * @return Observable<boolean> Returns true if the country is European, false otherwise.
   */
  checkIfEuropean(origin: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getCountries().subscribe(countries => {
        observer.next(countries.includes(origin));
        observer.complete();
      });
    });
  }
}
