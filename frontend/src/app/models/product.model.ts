/** 
 * @struct Product
 * @brief Interface representing product details.
 */
export interface Product {
    id: string;                     // Unique identifier of the product.
    name: string;                   // Name of the product.
    brand: string;                  // Brand of the product.
    description: string;             // Description of the product.
    category: string;                // Category of the product.
    tags: string[];                  // Associated tags for the product.
    ecoscore: string;                // Ecoscore rating of the product.
    origin: string;                  // Country of origin of the product.
    manufacturing_places: string;    // Manufacturing locations of the product.
    image: string;                   // Image URL of the product.
    source: 'Internal' | 'OpenFoodFacts'; // Data source of the product.
    status: string;
  }