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
}