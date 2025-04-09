/**
 * @struct Comment
 * @brief Interface representing a product comment.
 */
export interface Comment {    
    dateCom: string;        // Date when the comment was posted   
    contentCom: string;     // Content of the comment    
    userRatingCom: number;  // User rating (1-5)   
    source: string;         // Where does the product come from
    userId: number;         // ID of the user who posted the comment    
    productId:number | string;      // ID of the product being commented on    
    id?: number | string;   // Optional comment ID
  }