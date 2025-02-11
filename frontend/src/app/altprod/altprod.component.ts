import { Component } from '@angular/core';
import { NavbarComponent } from '../homepage/home/comp/navbar/navbar.component';
import { ProdalternativeComponent } from './comp/prodalternative/prodalternative.component'; 
import { ProdsearchComponent } from './comp/prodsearch/prodsearch.component';

@Component({
  selector: 'app-altprod',
  imports: [NavbarComponent, ProdalternativeComponent, ProdsearchComponent],
  templateUrl: './altprod.component.html',
  styleUrl: './altprod.component.css'
})
export class AltprodComponent {

}
