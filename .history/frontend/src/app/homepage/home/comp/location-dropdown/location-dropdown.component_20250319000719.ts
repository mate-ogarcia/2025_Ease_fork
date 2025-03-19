import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter, first } from 'rxjs/operators';
import { Router } from '@angular/router';
// API
import { ApiService } from '../../../../../services/api.service';
import { UsersService } from '../../../../../services/users/users.service';
import { ApiOpenFoodFacts } from '../../../../../services/openFoodFacts/openFoodFacts.service';
// Cache API
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
