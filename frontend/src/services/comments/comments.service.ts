/**
 * @file comments.service.ts
 * @brief Angular service for interacting with the backend API to manage comments.
 *
 * This service provides methods to retrieve comments from the backend NestJS API
 * using `HttpClient`.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comment } from '../../app/models/comments.model';

/**
 * @class CommentsService
 * @brief Service responsible for handling API calls related to comments.
 */
@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  /**
   * @property {string} _commentsUrl - The base URL for the comments API.
   * It is dynamically set based on the environment configuration.
   */
  private _commentsUrl = `${environment.globalBackendUrl}/comments`;

  /**
   * @constructor
   * @param {HttpClient} http - Angular HTTP client for making API requests.
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * Get all comments with pagination
   */
  getAllComments(page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<any>(`${this._commentsUrl}/GetAllComments`, { params });
  }

  /**
   * Sends a request to add a comment to the backend.
   * 
   * @param comment - The comment to be added.
   * @returns An observable that emits an array of comments after the request is successful.
   */
  postAddComment(comment: Comment): Observable<any[]> {
    return this.http.post<any[]>(`${this._commentsUrl}/add`, comment);
  }

  /**
   * Get comments for a specific product with pagination
   */
    getCommentsByProduct(productId: string, productSource: string, page: number = 1, pageSize: number = 10): Observable<any> {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString())
        .set('source', productSource);
  
      return this.http.get<any>(`${this._commentsUrl}/product/${productId}`, { params });
    }

}
