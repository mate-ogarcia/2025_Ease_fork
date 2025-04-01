#!/bin/bash
set -e

echo "🔄 Remplacer les variables d'environnement dans les fichiers JavaScript..."

# Afficher les valeurs réelles pour le debug
echo "Frontend URL avant remplacement: http://localhost:4200"
echo "Backend URL avant remplacement: http://localhost:3000/data"
echo "Frontend URL après remplacement: ${URL_FRONTEND}"
echo "Backend URL après remplacement: ${URL_BACKEND}"

# Remplacer les URLs spécifiques
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3000/data|${URL_BACKEND}|g" {} \;
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3000|${URL_BACKEND%/data}|g" {} \;

echo "✅ Variables d'environnement remplacées avec succès"
echo "Frontend URL: ${URL_FRONTEND}"
echo "Backend URL: ${URL_BACKEND}"
echo "🚀 Démarrage de Nginx..."

# Démarrer Nginx
exec "$@"