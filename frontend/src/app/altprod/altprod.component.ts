/**
 * @file altprod.component.ts
 * @brief Defines the AltProd component and its dependencies.
 */

import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { ProdalternativeComponent } from './comp/prodalternative/prodalternative.component';
import { ProdsearchComponent } from './comp/prodsearch/prodsearch.component';

/**
 * @class AltprodComponent
 * @brief Represents the AltProd component responsible for product search and alternative suggestions.
 */
@Component({
  selector: 'app-altprod', 
  imports: [NavbarComponent, ProdalternativeComponent, ProdsearchComponent],
  templateUrl: './altprod.component.html', 
  styleUrl: './altprod.component.css' ,
})
export class AltprodComponent {
  /**
   * @brief Default constructor for the AltprodComponent class.
   */
  constructor() { }
}
