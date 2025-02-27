import { Component } from '@angular/core';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { FormComponent} from './form/form.component';

@Component({
  selector: 'app-addproduct',
  imports: [NavbarComponent,FormComponent],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.css'
})
export class AddproductComponent {

}
