import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// Interface décrivant un badge
export interface Badge {
  id: number;
  emoji: string;
  title: string;       
  description: string; 
  bgColor: string;    
}

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.css']
})
export class BadgesComponent {

  badges: Badge[] = [
    {
      id: 1,
      emoji: '🤓',
      title: 'Expert',
      description: '25 shards unlocked',
      bgColor: '#FFD700' // Or
    },
    {
      id: 2,
      emoji: '🧠',
      title: 'Genius',
      description: 'Got more than 100 pinned posts',
      bgColor: '#FFA500' // Orange
    },
    {
      id: 3,
      emoji: '🌐',
      title: 'Networker',
      description: 'Followed by 250 people',
      bgColor: '#F4B400' // Jaune foncé
    },
    {
      id: 4,
      emoji: '🔥',
      title: 'Explosive',
      description: 'Reached 100 likes per post',
      bgColor: '#FF4500' // Rouge-orangé
    },
    {
      id: 5,
      emoji: '🤩',
      title: 'Addict',
      description: 'Has liked 1000 posts',
      bgColor: '#808080' // Gris
    },
    {
      id: 6,
      emoji: '🍎',
      title: 'iOS Expert',
      description: '30 devs showcased',
      bgColor: '#999999'
    },
    {
      id: 7,
      emoji: '🤖',
      title: 'Android Expert',
      description: '20 devs showcased',
      bgColor: '#3DDC84' // Vert Android
    },
    {
      id: 8,
      emoji: '🎨',
      title: 'Branding Expert',
      description: '500 brand assets created',
      bgColor: '#FBBC04'
    },
    {
      id: 9,
      emoji: '🖌️',
      title: 'Illustration Expert',
      description: '200 artworks shared',
      bgColor: '#FF69B4' // Rose
    },
    {
      id: 10,
      emoji: '🔮',
      title: '3D Expert',
      description: '15 3D projects showcased',
      bgColor: '#A020F0' // Violet
    },
    {
      id: 11,
      emoji: '💻',
      title: 'Web Expert',
      description: '50 websites deployed',
      bgColor: '#007BFF' // Bleu
    },
    {
      id: 12,
      emoji: '🏆',
      title: 'Winner',
      description: 'Won 1st place in a contest',
      bgColor: '#FFD700' // Or
    },
    {
      id: 13,
      emoji: '🥈',
      title: 'Silver Medalist',
      description: 'Got 2nd place in a challenge',
      bgColor: '#C0C0C0' // Argent
    },
    {
      id: 14,
      emoji: '🥉',
      title: 'Bronze Medalist',
      description: 'Got 3rd place in a challenge',
      bgColor: '#CD7F32' // Bronze
    },
    {
      id: 15,
      emoji: '💪',
      title: 'Challenger',
      description: 'Participated in 10 events',
      bgColor: '#FF8C00' // Orange foncé
    }
  ];

  /**
   * Assombrit légèrement la couleur (hex) de base.
   * @param color Hex ex: "#FFA500"
   * @param amount Nombre à soustraire (0-255) sur chaque canal (R, G, B)
   */
  darkenColor(color: string, amount: number = 40): string {
    color = color.replace('#', '');
    let r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
    let g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
    let b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);
    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');
    return `#${rr}${gg}${bb}`;
  }

  /**
   * Crée un dégradé radial allant de la couleur de base à une version assombrie.
   */
  createGradient(color: string): string {
    const darker = this.darkenColor(color, 20);
    return `radial-gradient(circle at center, ${color} 60%, ${darker} 100%)`;
  }
}
