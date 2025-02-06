/**
 * @file logging.middleware.ts
 * @brief Middleware NestJS pour journaliser les requêtes HTTP.
 *
 * Ce middleware intercepte toutes les requêtes entrantes, enregistre leur méthode, URL et
 * le code de statut de la réponse une fois la requête terminée. Il mesure également le temps 
 * d'exécution de chaque requête.
 *
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; // Import des types d'Express

/**
 * @class LoggingMiddleware
 * @brief Middleware pour journaliser les requêtes HTTP entrantes.
 *
 * Ce middleware enregistre les détails de chaque requête HTTP, notamment :
 * - La **méthode HTTP** (GET, POST, PUT, DELETE...).
 * - L'**URL demandée**.
 * - Le **code de statut de la réponse** (200, 404, 500...).
 * - Le **temps de traitement** de la requête en millisecondes.
 *
 * Une fois la requête traitée, ces informations sont affichées dans la console.
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * @brief Intercepte les requêtes HTTP et enregistre les détails.
   *
   * @param req Objet `Request` contenant les détails de la requête entrante.
   * @param res Objet `Response` contenant les détails de la réponse envoyée.
   * @param next Fonction pour passer la requête au prochain middleware ou au contrôleur.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const startTime = Date.now();

    // Écoute l'événement 'finish' pour logguer la réponse une fois terminée
    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - startTime;
      this.logger.log(`${method} ${url} ${statusCode} - ${elapsedTime}ms`);
    });

    next();
  }
}
