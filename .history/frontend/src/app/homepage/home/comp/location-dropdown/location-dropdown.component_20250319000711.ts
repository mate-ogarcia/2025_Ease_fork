import { Component, EventEmitter, Output } from '@angular/core';
import { DataCacheService } from '../../../../../services/cache/data-cache.service';

@Component({
  selector: 'app-location-dropdown',
  templateUrl: './location-dropdown.component.html',
  styleUrls: ['./location-dropdown.component.css']
})
export class LocationDropdownComponent {
  userLocation: string = '';
  recentLocations: string[] = ['France', 'Belgique', 'Suisse']; // Exemple de localisations récentes

  @Output() locationSelected = new EventEmitter<string>();

  onLocationChange() {
    // Vous pouvez ajouter ici une logique pour récupérer des suggestions, etc.
  }

  clearLocation() {
    this.userLocation = '';
  }

  searchByLocation() {
    // Par exemple, déclencher une recherche via un EventEmitter
    this.locationSelected.emit(this.userLocation);
  }

  selectLocation(location: string) {
    this.userLocation = location;
    this.locationSelected.emit(location);
  }
}
