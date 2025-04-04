/**
 * @file prodpage.component.ts
 * @brief Component for displaying product details.
 *
 * This component retrieves a product ID from the route parameters
 * and fetches the corresponding product details from either an internal API
 * or OpenFoodFacts. If no image is available, it fetches one from Unsplash.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';
// API
import { ApiService } from '../../services/api.service';
import { APIUnsplash } from '../../services/unsplash/unsplash.service';
import { ApiOpenFoodFacts } from '../../services/openFoodFacts/openFoodFacts.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { CommentsService } from '../../services/comments/comments.service';
import { Comment } from '../models/comments.model';

/**
 * @class ProdpageComponent
 * @brief Component responsible for displaying product details and handling image retrieval.
 */
@Component({
  selector: 'app-prodpage',
  standalone: true,
  imports: [NavbarComponent, CommonModule, CommentFormComponent],
  templateUrl: './prodpage.component.html',
  styleUrls: ['./prodpage.component.css']
})
export class ProdpageComponent implements OnInit {
  productId: string = '';           // The ID of the selected product.
  productSource: string = '';       // The source of the product (Internal or OpenFoodFacts).
  product: any = null;              // The product details.
  isLoading: boolean = false;       // Loading state flag.
  errorMessage: string = '';        // Error message in case of failure.
  selectedTab: string = 'description'; // Selected tab for displaying product information.
  showCommentForm = false;
  canAddComment: boolean = false;   // Determines if the user can add a comment.
  userRole: string | null = null;   // Stores the user role.

  /**
   * @brief Constructor initializes dependencies.
   * @param route ActivatedRoute to handle route parameters.
   * @param apiService ApiService to fetch internal product details.
   * @param apiUnsplash UnsplashService to fetch product images.
   * @param openFoodFactsService ApiOpenFoodFacts service to fetch external products.
   */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private apiUnsplash: APIUnsplash,
    private openFoodFactsService: ApiOpenFoodFacts,
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router,
    private commentService: CommentsService,
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   * It retrieves the product ID and source from the route parameters.
   */
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';
      this.productSource = params.get('source') || 'Internal';

      if (this.productId) {
        this.loadProduct(this.productId, this.productSource);
      }
    });

    this.authService.getUserRole().subscribe((role) => {
      this.userRole = role;
      this.canAddComment = role?.toLowerCase() === 'user' || role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'superadmin';
    });
  }

  /**
   * @brief Loads product details based on its source.
   * @param productId The unique identifier of the product.
   * @param productSource The source of the product (Internal or OpenFoodFacts).
   */
  loadProduct(productId: string, productSource: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.product = null;

    if (productSource === "Internal") {
      this.fetchInternalProduct(productId);
    } else if (productSource === "OpenFoodFacts") {
      this.fetchExternalProduct(productId);
    } else {
      console.warn(`⚠️ Unknown product source: ${productSource}`);
      this.errorMessage = "Unknown product source.";
      this.isLoading = false;
    }
  }

  /**
   * @brief Fetches an internal product.
   * @param productId The ID of the product.
   */
  fetchInternalProduct(productId: string) {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
          this.loadProductImage(this.product);
        } else {
          this.errorMessage = 'Product not found.';
        }
      },
      error: () => {
        this.errorMessage = 'Error loading product details.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  /**
   * @brief Fetches a product from OpenFoodFacts.
   * @param productId The ID of the product.
   */
  fetchExternalProduct(productId: string) {
    this.openFoodFactsService.getOpenFoodFactsProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = this.openFoodFactsService.formatOpenFoodFactsProduct(data);
          this.loadProductImage(this.product);
        } else {
          this.errorMessage = "Product not found on OpenFoodFacts.";
        }
      },
      error: (error) => {
        console.error("❌ Error retrieving product from OpenFoodFacts:", error);
        this.errorMessage = "Unable to fetch product from OpenFoodFacts.";
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * @brief Fetches an image from Unsplash if the product has no image.
   * @param product The product object.
   */
  private loadProductImage(product: any) {
    if (product.imageUrl) {
      return;
    }

    if (product.name) {
      this.apiUnsplash.searchPhotos(product.name).subscribe({
        next: (response) => {
          if (response.imageUrl) {
            product.image = response.imageUrl;
          } else {
            console.warn(`🚫 No image found for ${product.name}`);
          }
        },
        error: (err) => {
          console.error(`❌ Error retrieving image for ${product.name}:`, err);
        }
      });
    }
  }

  /**
   * @brief Updates the selected tab.
   * @param tab The tab to display.
   */
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  /**
   * @brief Tracks product items for *ngFor to optimize rendering.
   * @param index The index of the product.
   * @param product The product object.
   * @return The unique product ID.
   */
  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  // ============================ COMMENTS
  /**
   * @brief Handles the submission of a new comment.
   * 
   * This method is triggered when a user submits a comment. It sends the comment
   * to the backend service and updates the UI based on the success or failure 
   * of the submission. If successful, the comment is added and a success message is displayed.
   * If there is an error, an error message is shown.
   */
  onCommentSubmitted(comment: Comment) {
    // TODO: Implement logic to add comment to list or database
    this.commentService.postAddComment(comment).subscribe({
      next: (response) => {
        this.notifService.showSuccess('Commentaire ajouté avec succès !');
        this.showCommentForm = false; // Hide the comment form after submission
      },
      error: (error) => {
        this.notifService.showError('Problèmes lors de l\'ajout du commentaire, veuillez vérifiez que vous êtes connecté.');
        console.error("❌ Error adding comment:", error);
        alert("Error: Unable to add the comment.");
      }
    });
  }


  /**
   * Handles the click event for adding a comment.
   * 
   * If the user is not authenticated (i.e., they cannot add a comment),
   * it shows an error notification and redirects to the login page.
   * Otherwise, it displays the comment form.
   */
  onAddCommentClick(): void {
    // Check if the user is allowed to add a comment
    if (!this.canAddComment) {
      // Show an error message if the user is not logged in
      this.notifService.showError('Vous devez être connecté pour ajouter un commentaire!');
      // Redirect the user to the login page
      this.router.navigate(['/login']);
    } else {
      // If the user is allowed to add a comment, show the comment form
      this.showCommentForm = true;
    }
  }
}
