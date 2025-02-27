import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class ApiOpenFoodFacts {
    private _offUrl = environment.offUrl;

    /**
     * @brief Constructor initializes the HTTP client for making API requests.
     * 
     * @param http HttpClient instance for making API requests to external sources.
     */
    constructor(private http: HttpClient) { }

    getProductInfo(name: string): Observable<any> {
        return this.http.get<any[]>(`${this._offUrl}/search/${name}`);
    }

    // TODO
    getOpenFoodFactsProductById(productId: string): Observable<any> {
        return this.http.get<any[]>(`${this._offUrl}/getbyId/${productId}`);
    }

    /**
     * @brief Formats Open Food Facts product data to match our internal structure.
     * @param product The raw product data from Open Food Facts.
     * @returns {Product} Formatted product object.
     */
    formatOpenFoodFactsProduct(product: any): any {
        return {
            id: product.code,
            name: product.product_name || 'Unknown name',
            brand: product.brands || 'Unknown brand',
            category: product.categories || 'Unknown category',
            tags: product._keywords || 'Unknown tags',
            ecoscore: product.ecoscore_grade || 'Unavailable',
            origin: product.origin || product.countries.split(',')[0].trim() || 'Unavailable',
            manufacturing_places: product.manufacturing_places || 'Unavailable',
            description: product.generic_name || 'Unknown description',
            image: product.image_front_url || null,
            source: "OpenFoodFacts",
        }

    }
}