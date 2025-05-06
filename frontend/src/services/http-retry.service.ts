import { Injectable } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpRetryService {
  /**
   * Stratégie de retry avec backoff exponentiel
   * @param maxRetries Nombre maximum de tentatives
   * @param delayMs Délai initial en millisecondes
   */
  getRetryStrategy(maxRetries = 3, delayMs = 1000) {
    return retry({
      count: maxRetries,
      delay: (error, retryCount) => {
        const delay = Math.min(delayMs * Math.pow(2, retryCount - 1), 10000);
        return timer(delay);
      },
    });
  }
}
