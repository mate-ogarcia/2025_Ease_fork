/**
 * @file logging.middleware.ts
 * @brief NestJS middleware for logging HTTP requests.
 *
 * @details
 * This middleware intercepts all incoming HTTP requests, logging:
 * - The **HTTP method** (GET, POST, PUT, DELETE, etc.).
 * - The **requested URL**.
 * - The **response status code** (e.g., 200, 404, 500).
 * - The **execution time** for processing the request in milliseconds.
 *
 * After the request completes, the middleware outputs this information to the console.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * @class LoggingMiddleware
 * @brief Middleware for logging incoming HTTP requests.
 *
 * @details
 * The `LoggingMiddleware` captures and logs details of HTTP requests and responses,
 * providing insights into the application's request lifecycle. It logs the following:
 * - **Request Method:** HTTP verb used (GET, POST, PUT, DELETE, etc.).
 * - **Request URL:** The path requested by the client.
 * - **Response Status Code:** Final response code after processing.
 * - **Execution Time:** Duration taken to process the request in milliseconds.
 * 
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  // Logger instance dedicated to HTTP-related logs
  private readonly logger = new Logger('HTTP');

  /**
   * @brief Intercepts incoming requests and logs method, URL, status code, and execution time.
   *
   * @param req The `Request` object containing request details.
   * @param res The `Response` object used to send the response.
   * @param next The `NextFunction` to pass control to the next middleware or route handler.
   *
   * @details
   * - Records the start time when the request is received.
   * - Listens to the `finish` event on the response to capture the final status and timing.
   * - Logs a formatted message upon completion.
   *
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, url } = req;
    const startTime = Date.now();

    // Attach an event listener to capture when the response finishes
    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - startTime;
      this.logger.log(`${method} ${url} ${statusCode} - ${elapsedTime}ms`);
    });

    next(); // Proceed to the next middleware or route handler
  }
}
