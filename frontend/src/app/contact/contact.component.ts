/**
 * @file contact.component.ts
 * @brief Component for the contact page, handling form submission and displaying team/FAQ info.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

/**
 * @interface ContactForm
 * @brief Interface representing the contact form model.
 */
interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * @class ContactComponent
 * @brief Component for managing contact form, team members, and FAQs.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  /** @brief Model for form inputs. */
  contactForm: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  /** @brief Form submission state flags. */
  formSubmitted = false;
  formSuccess = false;
  formError = false;
  errorMessage = '';
  loading = false;

  /** @brief Contact information of the company. */
  companyInfo = {
    name: 'Ease-2025',
    address: 'Pau, France',
    email: 'easeprojectcap@gmail.com',
  };

  /** @brief Team member list. */
  teamMembers = [
    { name: 'Matéo GARCIA', role: 'Développeur Full-Stack' },
    { name: 'Tommy CHOUANGMALA', role: 'Développeur Full-Stack' },
    { name: 'Baptiste MINET', role: 'Développeur Full-Stack' }
  ];

  /** @brief Frequently asked questions data. */
  faqs = [
    {
      question: 'Comment puis-je suggérer un nouveau produit ?',
      answer: 'Vous pouvez ajouter un nouveau produit en vous connectant à votre compte et en cliquant sur " + produit" dans le menu principal.'
    },
    {
      question: 'Comment fonctionne la recherche d’alternatives ?',
      answer: 'Notre algorithme analyse les caractéristiques des produits importés et propose des alternatives européennes similaires en termes de qualité et de fonctionnalité.'
    },
    {
      question: 'Puis-je contribuer au projet ?',
      answer: 'Absolument ! Nous accueillons les contributions de la communauté. Contactez-nous via ce formulaire pour en savoir plus sur les opportunités de collaboration.'
    }
  ];

  constructor() { }

  /**
   * @brief Lifecycle hook that runs after component initialization.
   */
  ngOnInit(): void {}

  /**
   * @brief Handles contact form submission.
   * @param form The submitted form reference.
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.loading = true;
    this.formSubmitted = true;

    // Simulate API call (replace with real API logic)
    setTimeout(() => {
      if (this.contactForm.email.includes('@')) {
        this.formSuccess = true;
        this.formError = false;
        this.contactForm = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        form.resetForm();
      } else {
        this.formSuccess = false;
        this.formError = true;
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.';
      }
      this.loading = false;
    }, 1500);
  }

  /**
   * @brief Resets form feedback state.
   */
  resetFormState(): void {
    this.formSubmitted = false;
    this.formSuccess = false;
    this.formError = false;
    this.errorMessage = '';
  }
}
