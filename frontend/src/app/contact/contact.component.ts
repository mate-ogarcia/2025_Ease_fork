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
    { name: 'Matéo GARCIA', role: 'Full-Stack Developer' },
    { name: 'Tommy CHOUANGMALA', role: 'Full-Stack Developer' },
    { name: 'Baptiste MINET', role: 'Full-Stack Developer' }
  ];

  /** @brief Frequently asked questions data. */
  faqs = [
    {
      question: 'How can I suggest a new product?',
      answer: 'You can add a new product by logging into your account and clicking on "Add Product" in the main menu.'
    },
    {
      question: 'How does the alternative search work?',
      answer: 'Our algorithm analyzes the characteristics of imported products and offers similar European alternatives in terms of quality and functionality.'
    },
    {
      question: 'Can I contribute to the project?',
      answer: 'Absolutely! We welcome community contributions. Contact us through this form to learn more about collaboration opportunities.'
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
        this.errorMessage = 'An error occurred while sending your message. Please try again.';
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
