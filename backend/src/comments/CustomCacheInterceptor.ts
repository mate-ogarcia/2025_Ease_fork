/**
 * @file custom-cache.interceptor.ts
 * @brief Custom Cache Interceptor for handling caching logic in NestJS.
 * 
 * This interceptor extends the default `CacheInterceptor` to provide a custom caching key
 * generation based on the product ID in the URL.
 * The `trackBy` method is overridden to log and return a cache key specific to the product.
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * @class CustomCacheInterceptor
 * @brief Custom interceptor that extends `CacheInterceptor` to provide custom caching logic.
 * 
 * This class customizes the cache key generation by overriding the `trackBy` method.
 * It ensures that each product's comments are cached separately based on the product's `productId`.
 */
@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  /**
   * @brief Overrides the default trackBy method to provide a custom cache key.
   * 
   * This method is responsible for generating a cache key that uniquely identifies
   * the cache for a specific product based on the `productId` parameter in the URL.
   * It logs the generated cache key to the console for debugging purposes.
   * 
   * @param {ExecutionContext} context - The execution context that provides information about the request.
   * @returns {string | undefined} The generated cache key for the product.
   */
  trackBy(context: ExecutionContext): string | undefined {
    // Get the request object from the execution context
    const request = context.switchToHttp().getRequest();
    
    // Extract the productId parameter from the request route
    const productId = request.params.productId;

    // Construct a custom cache key based on the productId
    const cacheKey = `product_${productId}`;
    return cacheKey;
  }
}
