import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
// Environment configuration
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private locationUrl = `${environment.globalBackendUrl}/location`;

  /**
   * @brief Constructor for LocationService
   * @param http Angular's HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * @brief Fetches the user's location data from the backend
   * @returns {Observable<any>} An observable containing location data
   */
  getLocation(): Observable<any> {
    return this.http.get<any>(this.locationUrl);
  }
}
