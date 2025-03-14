import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);

  // Log tous les cookies au début de chaque requête
  console.log('🔍 Interceptor - Available cookies:', cookieService.getAll());

  // Vérifier si la requête est vers l'API
  const isApiRequest = req.url.includes('localhost:3000') || req.url.includes('api');
  console.log(`📡 Request to: ${req.url} (isApiRequest: ${isApiRequest})`);

  // Clone la requête avec withCredentials pour tous les appels API
  let newReq = req.clone({
    withCredentials: true
  });

  // Ajouter le token seulement pour les requêtes API
  if (isApiRequest) {
    const token = cookieService.get('accessToken');
    if (token) {
      console.log('🔑 Adding token to request headers');
      newReq = newReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('📤 Request headers set:', newReq.headers.get('Authorization')?.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token available for API request');
      // Toujours continuer sans redirection
      return next(newReq);
    }
  }

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('❌ Request error:', {
        status: error.status,
        url: error.url,
        message: error.message
      });

      if (error.status === 401) {
        console.log('🔒 Authentication error detected');

        // Ne jamais rediriger vers la page de login lors d'un rechargement de page
        // Laisser l'utilisateur sur la page actuelle
        console.log('🔄 Keeping user on current page despite 401');
      }
      return throwError(() => error);
    })
  );
};  