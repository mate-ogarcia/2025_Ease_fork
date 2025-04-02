import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Vérifier si l'URL est absolue et pointe vers notre backend
    if (request.url.startsWith('http://localhost:3000')) {
      // Transformer l'URL absolue en URL relative avec /api
      const apiUrl = request.url.replace('http://localhost:3000', '/api');
      const apiRequest = request.clone({
        url: apiUrl
      });
      return next.handle(apiRequest);
    }

    return next.handle(request);
  }
} 