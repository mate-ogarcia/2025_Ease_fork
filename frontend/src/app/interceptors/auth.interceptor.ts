/**
 * @file auth.interceptor.ts
 * @description
 * This file contains an HTTP interceptor that is responsible for adding authentication credentials to outgoing HTTP requests.
 * It checks whether the request is targeting internal API endpoints or external services (like OpenStreetMap).
 * For internal API requests, it adds an authorization token (if available) either from cookies or localStorage.
 * For OpenStreetMap requests, it avoids adding any authentication credentials.
 * The interceptor ensures that cross-site credentials are included where necessary.
 * 
 * It also prevents sending credentials with OpenStreetMap requests and selectively applies the authentication token
 * to API requests that require it.
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);

  // Retrieve environment information

  // Check if the request is for the internal API or OpenStreetMap
  const isApiRequest = !req.url.includes('localhost:4200') &&
    (req.url.includes('localhost:3000') ||
      req.url.includes('api') ||
      req.url.includes('render.com'));

  const isOpenStreetMapRequest = req.url.includes('openstreetmap.org') ||
    req.url.includes('nominatim') ||
    req.url.includes('osm');

  // Do not add withCredentials for OpenStreetMap requests
  let newReq;
  if (isOpenStreetMapRequest) {
    // For OpenStreetMap, do not add credentials
    newReq = req.clone();
  } else {
    // For other requests, use withCredentials
    newReq = req.clone({
      withCredentials: true
    });

    // Add the token only for internal API requests
    if (isApiRequest) {
      // Vérifier d'abord les cookies
      let token = cookieService.get('accessToken');
      let tokenSource = 'cookie';

      // Log des cookies disponibles
      const allCookies = cookieService.getAll();
      console.log('🍪 Available cookies:', allCookies);

      // Si le token n'est pas dans les cookies, vérifier le localStorage
      if (!token) {
        console.log('⚠️ No token found in cookies, checking localStorage...');
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          console.log('⚠️ Token found in localStorage (fallback)');
          token = storedToken;
          tokenSource = 'localStorage';
        }
      }

      if (token) {
        console.log(`✅ Token found in ${tokenSource}:`, token.substring(0, 20) + '...');
        newReq = newReq.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.log('❌ No token found in either cookies or localStorage');
      }
    }
  }

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('🔒 Unauthorized access - clearing tokens');
        // Clear both cookie and localStorage
        cookieService.delete('accessToken', '/');
        localStorage.removeItem('accessToken');
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};
