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

      // Si c'est un rechargement de page et qu'on n'est pas déjà sur login
      if (document.readyState === 'complete' && !window.location.pathname.includes('/login')) {
        console.log('🔄 Page reload detected without token - staying on current page');
        return next(newReq); // Continue sans redirection
      }
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

        // Ne pas rediriger si c'est un rechargement de page et qu'on n'est pas sur login
        const isPageReload = document.readyState === 'complete';
        const isLoginPage = window.location.pathname.includes('/login');

        if (!isPageReload || isLoginPage) {
          console.log('🚀 Redirecting to login page');
          cookieService.delete('accessToken', '/');
          router.navigate(['/login']);
        } else {
          console.log('🔄 Keeping user on current page despite 401');
        }
      }
      return throwError(() => error);
    })
  );
};  