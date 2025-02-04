import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-article',
  imports: [], // Import implicite
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent implements AfterViewInit {
  @ViewChild('carouselTrack', { static: false }) trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('nextButton', { static: false }) nextButtonRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('prevButton', { static: false }) prevButtonRef!: ElementRef<HTMLButtonElement>;

  private index: number = 0;
  private articlesPerPage: number = 3; // Nombre d'articles visibles en même temps
  private totalItems: number = 0;
  private itemWidth: number = 300; // Largeur d'un article

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.trackRef && this.nextButtonRef && this.prevButtonRef) {
        const track = this.trackRef.nativeElement;
        const nextButton = this.nextButtonRef.nativeElement;
        const prevButton = this.prevButtonRef.nativeElement;
        const items = track.children as HTMLCollectionOf<HTMLElement>;
        this.totalItems = items.length;

        nextButton.addEventListener('click', () => {
          if (this.index < this.totalItems - this.articlesPerPage) {
            this.index++;
            this.updateCarousel(track);
          }
        });

        prevButton.addEventListener('click', () => {
          if (this.index > 0) {
            this.index--;
            this.updateCarousel(track);
          }
        });
      } else {
        console.error('Les éléments du carrousel ne sont pas disponibles.');
      }
    }, 100);
  }

  private updateCarousel(track: HTMLDivElement): void {
    const moveAmount = this.index * this.itemWidth; // Déplace de 1 article
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${moveAmount}px)`;
  }
}
