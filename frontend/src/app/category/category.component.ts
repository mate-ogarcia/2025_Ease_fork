import { Component } from '@angular/core';
import { NavbarComponent } from '../homepage/home/comp/navbar/navbar.component';
import { ChoiceComponent } from './comp/choice/choice.component';
@Component({
  selector: 'app-category',
  imports: [NavbarComponent, ChoiceComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

}
