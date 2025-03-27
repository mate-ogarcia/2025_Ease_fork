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
      title: 'Découvreur Européen',
      description: 'A exploré 25 alternatives de produits européens',
      bgColor: '#FFD700'
    },
    {
      id: 2,
      emoji: '🧠',
      title: 'Curateur Expert',
      description: 'A sauvegardé 100 produits alternatifs européens',
      bgColor: '#FFA500'
    },
    {
      id: 3,
      emoji: '🌐',
      title: 'Connecteur Européen',
      description: 'A inspiré 250 utilisateurs vers des choix européens',
      bgColor: '#F4B400'
    },
    {
      id: 4,
      emoji: '🔥',
      title: 'Influenceur Alternatif',
      description: 'Ses recommandations ont généré 100 likes sur des alternatives',
      bgColor: '#FF4500'
    },
    {
      id: 5,
      emoji: '🤩',
      title: 'Engagé du Choix',
      description: 'A validé 1000 produits alternatifs par ses likes',
      bgColor: '#808080'
    },
    {
      id: 6,
      emoji: '🍎',
      title: 'Pionnier Digital',
      description: 'A testé 30 alternatives numériques européennes',
      bgColor: '#999999'
    },
    {
      id: 7,
      emoji: '🤖',
      title: 'Explorateur Mobile',
      description: 'A évalué 20 alternatives de smartphones européens',
      bgColor: '#3DDC84'
    },
    {
      id: 8,
      emoji: '🎨',
      title: 'Créateur de Tendances',
      description: 'A partagé 500 designs inspirés des produits européens',
      bgColor: '#FBBC04'
    },
    {
      id: 9,
      emoji: '🖌️',
      title: 'Artiste Visuel',
      description: 'A proposé 200 visuels d’alternatives innovantes',
      bgColor: '#FF69B4'
    },
    {
      id: 10,
      emoji: '🔮',
      title: 'Innovateur 3D',
      description: 'A présenté 15 prototypes 3D de produits alternatifs',
      bgColor: '#A020F0'
    },
    {
      id: 11,
      emoji: '💻',
      title: 'Comparateur Digital',
      description: 'A déployé 50 outils de comparaison de produits européens',
      bgColor: '#007BFF'
    },
    {
      id: 12,
      emoji: '🏆',
      title: 'Champion Européen',
      description: 'A remporté un concours pour la meilleure alternative européenne',
      bgColor: '#FFD700'
    },
    {
      id: 13,
      emoji: '🥈',
      title: 'Finaliste Argent',
      description: 'Deuxième place dans un défi d’alternatives européennes',
      bgColor: '#C0C0C0'
    },
    {
      id: 14,
      emoji: '🥉',
      title: 'Récipiendaire Bronze',
      description: 'Troisième place dans un challenge de produits alternatifs',
      bgColor: '#CD7F32'
    },
    {
      id: 15,
      emoji: '💪',
      title: 'Défi Relevé',
      description: 'A participé à 10 défis de sélection d’alternatives européennes',
      bgColor: '#FF8C00'
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
