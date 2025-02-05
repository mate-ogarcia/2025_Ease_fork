import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/data';

  constructor(private http: HttpClient) {} // ✅ HttpClient est injecté correctement

  getData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
