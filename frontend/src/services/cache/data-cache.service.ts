/**
 * @file data-cache.service.ts
 * @brief Service for caching and retrieving application data.
 * 
 * This service fetches and caches data such as countries, categories, and brands 
 * from the backend API to optimize performance and reduce redundant API calls.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root', // Ensures the service is a singleton
})
export class DataCacheService {  
  private countries$ = new ReplaySubject<string[]>(1);  // Subject holding the list of European countries.
  private categories$ = new ReplaySubject<any[]>(1);    // Subject holding the list of product categories.
  private brands$ = new ReplaySubject<any[]>(1);        // Subject holding the list of brands.
  private isLoaded = false;                             // Flag to prevent redundant data loading.
  private apiCountriesUrl = environment.apiCountrieUrl; // Backend URL

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
   * Prevents unnecessary reloading on F5 (data is stored in localStorage).
   * Optimizes performance by reducing HTTP requests.
   * Ensures that data is loaded only once, even if the user refreshes the page.
   */
  loadData(): void {
    if (this.isLoaded) return;
    this.isLoaded = true;
  
    const cachedCountries = localStorage.getItem('countries');
    const cachedCategories = localStorage.getItem('categories');
    const cachedBrands = localStorage.getItem('brands');
  
    if (cachedCountries && cachedCategories) {
      this.countries$.next(JSON.parse(cachedCountries));
      this.categories$.next(JSON.parse(cachedCategories));
    }
    // Fetch European countries
    this.http.get<string[]>(this.apiCountriesUrl).pipe(
      tap(countries => {
        localStorage.setItem('countries', JSON.stringify(countries));
        this.countries$.next(countries);
      })
    ).subscribe();
    // Fetch all the category name in the DB
    this.apiService.getAllCategories().pipe(
      tap(categories => {
        localStorage.setItem('categories', JSON.stringify(categories));
        this.categories$.next(categories.sort());
      })
    ).subscribe();
    // Fetch all the brand name in the DB
    this.apiService.getAllBrands().pipe(
      tap(brands => {
        localStorage.setItem('brands', JSON.stringify(brands));
        this.brands$.next(brands.sort());
      })
    ).subscribe();
  
    if (cachedBrands) {
      this.brands$.next(JSON.parse(cachedBrands));
    }
    this.refreshBrands();
  }
  
  /**
   * @brief Refreshes the brand list on demand.
   * @note This function is useful if the brand data changes frequently.
   */
  refreshBrands(): void {
    this.apiService.getAllBrands().pipe(
      tap(brands => {
        localStorage.setItem('brands', JSON.stringify(brands));
        this.brands$.next(brands.sort());
      })
    ).subscribe();
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
    return this.countries$.pipe(
      map((countries: string[]) => countries.includes(origin))
    );
  }
}
