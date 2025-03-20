import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @class ApiAddress
 * @brief Service responsible for handling address validation and completion using OpenStreetMap (Nominatim).
 */
@Injectable({
  providedIn: 'root',
})
export class ApiAddress {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) { }

  /**
   * Fetch address details from OpenStreetMap (Nominatim) based on user input.
   * @param address The address string entered by the user.
   * @returns Observable with formatted address details.
   */
  getAddressDetails(address: string): Observable<any> {
    const params = {
      q: address,
      format: 'json',
      addressdetails: '1', // Enables structured address data in the response
      limit: '1', // Get only the most relevant result
    };

    return this.http.get<any[]>(this.NOMINATIM_URL, { params }).pipe(
      map(response => {
        if (response.length === 0) {
          throw new Error('Adresse introuvable');
        }
        return this.formatAddress(response[0]);
      })
    );
  }

  /**
   * Format the API response into a structured address object.
   * @param data Response from Nominatim API.
   * @returns Formatted address object.
   */
  private formatAddress(data: any) {
    return {
      street: data.address.road || '',
      houseNumber: data.address.house_number || '',
      city: data.address.city || data.address.town || data.address.village || '',
      postcode: data.address.postcode || '',
      country: data.address.country || '',
      lat: data.lat,
      lon: data.lon,
    };
  }

  /**
   * Get address suggestions based on partial input.
   * @param query Partial address input.
   * @returns Observable of address suggestions.
   */
  autocompleteAddress(query: string): Observable<any[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
    };

    return this.http.get<any[]>(this.NOMINATIM_URL, { params }).pipe(
      map(response => response.map(this.formatAddress))
    );
  }

}
