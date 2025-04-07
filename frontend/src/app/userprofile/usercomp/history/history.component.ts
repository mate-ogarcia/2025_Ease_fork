/**
 * @file history.component.ts
 * @brief Component for displaying the history of searched products.
 *
 * This component retrieves previously searched products from the history service
 * and displays them in either a list or grid view. It allows users to re-search
 * items from their history by clicking on them.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Services
import { HistoryService, SearchHistoryItem } from '../../../../services/history/history.service';
import { ApiService } from '../../../../services/api.service';
import { NotificationService } from '../../../../services/notification/notification.service';
// RxJS
import { finalize } from 'rxjs/operators';

/**
 * @class HistoryComponent
 * @brief Component responsible for displaying the search history of products.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  resultsArray: SearchHistoryItem[] = []; ///< Array to store history items.
  viewMode: 'list' | 'grid' = 'list'; ///< Default display mode.
  isLoading: boolean = true; ///< Loading state flag.
  error: string | null = null; ///< Error message if present.
  successMessage: string | null = null; ///< Success message if present.

  /**
   * @brief Constructor initializes dependencies.
   * @param router Router for navigation.
   * @param historyService Service for fetching user's search history.
   * @param apiService Service for executing searches.
   * @param notificationService Service for displaying notifications.
   */
  constructor(
    private router: Router,
    private historyService: HistoryService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   */
  ngOnInit(): void {
    console.log('🔍 history.component - ngOnInit');

    // Vérifier si des données de test sont présentes
    if (this.resultsArray && this.resultsArray.length > 0) {
      console.warn('⚠️ Des données sont déjà présentes dans resultsArray:', this.resultsArray);
    }

    // Vérifier les données dans le localStorage
    try {
      const keys = Object.keys(localStorage);
      console.log('🔍 Clés dans localStorage:', keys);

      for (const key of keys) {
        if (key.includes('history') || key.includes('search')) {
          console.warn(`⚠️ Trouvé dans localStorage: ${key}:`, localStorage.getItem(key));
        }
      }
    } catch (e) {
      console.error('❌ Erreur lors de la lecture du localStorage:', e);
    }

    this.setViewMode('list'); // Set default view mode to list
    this.loadHistory();
  }

  /**
   * @brief Loads the user's search history.
   */
  loadHistory(): void {
    console.log('🔍 Tentative de chargement de l\'historique...');
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.historyService.getUserHistory().subscribe({
      next: (historyItems) => {
        console.log('✅ Historique récupéré, nombre d\'éléments:', historyItems.length);
        console.log('📋 Détails de l\'historique:', JSON.stringify(historyItems, null, 2));

        if (historyItems.length === 0) {
          console.log('ℹ️ Aucun élément d\'historique trouvé dans la BDD');
        }

        this.resultsArray = historyItems;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l\'historique:', err);
        this.isLoading = false;
        this.error = 'Erreur lors du chargement de l\'historique. Veuillez réessayer.';
        this.notificationService.showError('Erreur lors du chargement de l\'historique. Veuillez réessayer.');
      }
    });
  }

  /**
   * @brief Sets the display mode for the results.
   * @param mode The desired view mode ('list' or 'grid').
   */
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  /**
   * @brief Extracts the search term from a history item.
   * @param item The history item to extract the search term from.
   * @return The search term.
   */
  getSearchTerm(item: any): string {
    console.log('🔍 Analyse de l\'élément d\'historique:', item);

    // Essayer différentes propriétés où le terme de recherche pourrait être stocké
    if (typeof item === 'object' && item) {
      // Chercher d'abord dans les propriétés standard
      if (item.productName) {
        console.log('  ✓ Trouvé dans productName:', item.productName);
        return this.cleanHtmlTags(item.productName);
      }

      // Vérifier les données Elasticsearch
      if (item._source && item._source.productName) {
        console.log('  ✓ Trouvé dans _source.productName:', item._source.productName);
        return this.cleanHtmlTags(item._source.productName);
      }

      // Chercher dans fragments si c'est un objet de type elasticSearch
      if (item.fragments && Array.isArray(item.fragments)) {
        const nameFragment = item.fragments.find((f: any) => f.field === 'name' || f.field === 'productName');
        if (nameFragment && nameFragment.term) {
          console.log('  ✓ Trouvé dans fragments:', nameFragment.term);
          return this.cleanHtmlTags(nameFragment.term);
        }
      }

      // Vérifier spécifiquement le scénario ElasticSearch
      if (item.productData && typeof item.productData === 'object') {
        if (item.productData.name) {
          console.log('  ✓ Trouvé dans productData.name:', item.productData.name);
          return this.cleanHtmlTags(item.productData.name);
        }
        if (item.productData.productName) {
          console.log('  ✓ Trouvé dans productData.productName:', item.productData.productName);
          return this.cleanHtmlTags(item.productData.productName);
        }
      }

      // Recherche dans les valeurs directes au niveau supérieur
      for (const key of ['name', 'term', 'query', 'searchText', 'title']) {
        if (item[key] && typeof item[key] === 'string') {
          console.log(`  ✓ Trouvé dans ${key}:`, item[key]);
          return this.cleanHtmlTags(item[key]);
        }
      }

      // Recherche dans les valeurs de second niveau
      for (const prop in item) {
        const value = item[prop];
        if (typeof value === 'object' && value !== null) {
          for (const subProp of ['name', 'productName', 'query', 'searchText', 'term']) {
            if (value[subProp] && typeof value[subProp] === 'string') {
              console.log(`  ✓ Trouvé dans ${prop}.${subProp}:`, value[subProp]);
              return this.cleanHtmlTags(value[subProp]);
            }
          }
        }
      }
    }

    console.log('⚠️ Aucun terme de recherche trouvé, utilisation de la valeur par défaut');
    return "Recherche";
  }

  /**
   * @brief Nettoie les balises HTML d'une chaîne de caractères.
   * @param text Le texte à nettoyer.
   * @return Le texte nettoyé.
   */
  cleanHtmlTags(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // Enlever les balises HTML
    let cleanText = text.replace(/<\/?[^>]+(>|$)/g, '');

    // Enlever les caractères spéciaux HTML
    cleanText = cleanText.replace(/&[^;]+;/g, '');

    // Trim et normalisation des espaces
    cleanText = cleanText.trim().replace(/\s+/g, ' ');

    console.log('  🧹 Texte nettoyé:', cleanText);
    return cleanText;
  }

  /**
   * @brief Searches again for the product when a history item is clicked.
   * @param historyItem The selected history item.
   */
  searchAgain(historyItem: any): void {
    console.log('🔍 Recherche à partir de l\'historique:', historyItem);

    // Afficher l'indicateur de chargement
    this.isLoading = true;

    // Extraire le terme de recherche
    const searchTerm = this.getSearchTerm(historyItem);

    if (!searchTerm || searchTerm === "Recherche") {
      console.error('❌ Terme de recherche non valide trouvé');
      this.isLoading = false;
      this.error = 'Impossible de relancer cette recherche. Terme non valide.';
      return;
    }

    console.log('🔍 Terme de recherche extrait:', searchTerm);

    // Extraire l'ID du produit (prend en compte la structure nestée)
    let productId = historyItem.productId;
    if (!productId && historyItem._default) {
      productId = historyItem._default.productId;
    }

    console.log('🔍 ID du produit extrait:', productId);

    // Construire la requête de recherche
    const searchRequest = {
      productId: productId || "",
      productName: searchTerm,
      currentRoute: '/home'
    };

    console.log('🔍 Envoi de la requête de recherche:', searchRequest);

    // Envoyer la requête au service API
    this.apiService.postProductsWithFilters(searchRequest).subscribe({
      next: (results) => {
        console.log('✅ Résultats de recherche reçus:', results.length || 0, 'produits');
        this.isLoading = false;

        // Si on a un ID de produit valide et un seul résultat, on peut naviguer directement vers la page du produit
        if (productId && results.length === 1) {
          console.log('✅ Navigation directe vers la page du produit:', productId);
          this.router.navigate(['/prodpage', productId]);
          return;
        }

        // Sinon, naviguer vers la page des résultats de recherche
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: results }
          });
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la recherche:', err);
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  /**
   * @brief Tracks history items for *ngFor to optimize rendering.
   * @param index The index of the history item.
   * @param item The history item.
   * @return The unique history ID or product ID.
   */
  trackByProduct(index: number, item: any): any {
    // Utiliser l'ID de l'historique, qui est unique même pour les entrées dupliquées
    return item.id || `${item.productId}-${index}`;
  }

  // Ajouter une méthode pour effacer l'historique
  clearHistory(): void {
    console.log('🧹 Tentative de suppression de l\'historique complet');

    // Demander confirmation avant de supprimer tout l'historique
    if (!confirm('Êtes-vous sûr de vouloir supprimer tout votre historique de recherche ?')) {
      console.log('❌ Suppression de l\'historique annulée par l\'utilisateur');
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    // Log détaillé pour comprendre ce qui se passe
    console.log('🧹 Appel de clearUserHistory...');

    this.historyService.clearUserHistory()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('✅ Historique effacé avec succès:', response);

          // Analyser la réponse
          if (response.deleted === 0 && response.failed === 0) {
            console.log('ℹ️ Aucun élément n\'était présent dans l\'historique');
          } else if (response.failed && response.failed > 0) {
            console.warn(`⚠️ ${response.failed} éléments n'ont pas pu être supprimés`);
          }

          this.isLoading = false;

          // Vider l'array local immédiatement pour mise à jour visuelle instantanée
          this.resultsArray = [];

          // Recharger l'historique vide pour vérification
          setTimeout(() => this.loadHistory(), 500);

          // Essayer également de supprimer le cache local
          try {
            localStorage.removeItem('searchHistory');
            sessionStorage.removeItem('searchHistory');
          } catch (e) {
            console.error('❌ Erreur lors de la suppression du cache:', e);
          }

          // Message approprié selon le résultat
          if (response.deleted > 0) {
            this.notificationService.showSuccess(`Votre historique a été effacé avec succès (${response.deleted} élément${response.deleted > 1 ? 's' : ''})`);
          } else {
            this.notificationService.showInfo('Aucun élément à supprimer dans l\'historique');
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression de l\'historique:', err);
          this.isLoading = false;

          // Extraire le message d'erreur détaillé si disponible
          let errorMessage = 'Erreur lors de la suppression de l\'historique.';

          if (err.error && err.error.message) {
            errorMessage += ` ${err.error.message}`;
          } else if (err.message) {
            errorMessage += ` ${err.message}`;
          }

          console.error('Message d\'erreur détaillé:', errorMessage);

          // Afficher une notification d'erreur avec détails
          this.notificationService.showError(errorMessage);
        }
      });
  }

  /**
   * @brief Supprime un élément spécifique de l'historique.
   * @param historyItem L'élément d'historique à supprimer.
   * @param event L'événement de clic pour éviter la propagation.
   */
  deleteHistoryItem(historyItem: any, event: Event): void {
    // Empêcher la propagation pour éviter de déclencher searchAgain()
    event.stopPropagation();

    console.log('🗑️ Suppression de l\'élément d\'historique complet:', historyItem);
    console.log('🗑️ Type de l\'élément:', typeof historyItem);
    console.log('🗑️ Clés disponibles:', Object.keys(historyItem));
    console.log('🗑️ ID de l\'élément:', historyItem.id);
    console.log('🗑️ ID brut:', JSON.stringify(historyItem.id));

    // Essayons de trouver un ID à partir des propriétés disponibles
    let historyId = historyItem.id || historyItem._id;

    // Si l'élément est enveloppé dans une structure _default, essayons de l'extraire
    if (historyItem._default && typeof historyItem._default === 'object') {
      historyId = historyItem._default.id || historyItem._default._id;
      console.log('🗑️ ID extrait de _default:', historyId);
    }

    if (!historyId) {
      console.error('❌ Impossible de supprimer un élément sans ID:', historyItem);
      this.notificationService.showError('Impossible de supprimer cet élément. ID manquant.');
      return;
    }

    // Afficher l'indicateur de chargement
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    console.log('🗑️ Tentative de suppression avec l\'ID:', historyId);

    this.historyService.deleteHistoryItem(historyId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('✅ Élément supprimé avec succès:', response);

          // Mettre à jour l'affichage en retirant l'élément supprimé
          this.resultsArray = this.resultsArray.filter(item => {
            const itemId = item.id || (item._default && item._default.id);
            return itemId !== historyId;
          });

          // Afficher une notification de succès
          this.notificationService.showSuccess('Élément supprimé avec succès');
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression de l\'élément:', err);
          this.notificationService.showError('Erreur lors de la suppression. Veuillez réessayer.');
        }
      });
  }
}
