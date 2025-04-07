/**
 * @file comments.service.ts
 * @brief Angular service for interacting with the backend API to manage comments.
 *
 * This service provides methods to retrieve comments from the backend NestJS API
 * using `HttpClient`.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comment } from '../../app/models/comments.model';

/**
 * @class CommentsService
 * @brief Service responsible for handling API calls related to comments.
 * 
 * This service interacts with the backend API to manage comment-related operations,
 * including retrieving and posting comments.
 */
@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  // The base URL for the comments API.
  private _commentsUrl = `${environment.globalBackendUrl}/comments`;

  /**
   * @constructor
   * @brief Initializes the CommentsService with the HttpClient for API requests.
   * @param {HttpClient} http - Angular HTTP client for making API requests.
   */
  constructor(
    private http: HttpClient
  ) { }

  /**
   * @brief Sends a request to add a comment to the backend.
   * 
   * This method posts a new comment to the backend API and returns an observable
   * that emits an array of comments once the request is successful.
   * 
   * @param {Comment} comment - The comment to be added to the backend.
   * @returns {Observable<any[]>} An observable that emits an array of comments after the request is successful.
   */
  postAddComment(comment: Comment): Observable<any[]> {
    return this.http.post<any[]>(`${this._commentsUrl}/add`, comment);
  }

  /**
   * @brief Get comments for a specific product with pagination.
   * 
   * This method retrieves comments for a specific product, supporting pagination.
   * It sends an HTTP GET request to the backend API with pagination parameters.
   * 
   * @param {string} productId - The ID of the product for which comments are retrieved.
   * @param {string} productSource - The source of the product (e.g., "shop" or "catalog").
   * @param {number} [page=1] - The page number to retrieve (optional, default: 1).
   * @param {number} [pageSize=10] - Number of comments per page (optional, default: 10).
   * @returns {Observable<any>} An observable that emits the response containing the comments.
   */
  getCommentsByProduct(productId: string, productSource: string, page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('source', productSource);

    return this.http.get<any>(`${this._commentsUrl}/product/${productId}`, { params });
  }

  /**
   * @brief Retrieves the total comment count for a specific product.
   * 
   * This method makes an HTTP request to the backend API to fetch the total count of comments 
   * for the product identified by the given `productId`. The response contains the comment count, 
   * which is returned by this method.
   * 
   * @param {string} productId - The ID of the product for which the comment count is retrieved.
   * @returns {Promise<number>} A promise that resolves to the total comment count for the specified product.
   * @throws {Error} If an error occurs while making the HTTP request or retrieving the comment count.
   */
  async getCommentCountForProduct(productId: string): Promise<number> {
    const response = await lastValueFrom(
      this.http.get<{ count: number }>(`${this._commentsUrl}/product/${productId}/count`)
    );
    return response.count;
  }
}
