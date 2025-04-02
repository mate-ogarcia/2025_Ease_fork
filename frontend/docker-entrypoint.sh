#!/bin/bash
set -e

echo "🔄 Remplacer les variables d'environnement dans les fichiers JavaScript..."

# Afficher les valeurs réelles pour le debug
echo "Frontend URL avant remplacement: http://localhost:4200"
echo "Backend URL avant remplacement: http://localhost:3000/data"
echo "Frontend URL après remplacement: ${URL_FRONTEND}"
echo "Backend URL après remplacement: ${URL_BACKEND}"
echo "Backend Base URL après remplacement: ${URL_BACKEND%/data}"

# Sauvegarder quelques fichiers pour vérification après remplacement
mkdir -p /tmp/debug-backup
find /usr/share/nginx/html -type f -name "main.*.js" | head -1 | xargs -I{} cp {} /tmp/debug-backup/main.js.before

# Remplacer les URLs dans l'ordre inverse (du plus spécifique au plus général)
# D'abord remplacer l'URL générique du backend (sans /data)
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3000|${URL_BACKEND%/data}|g" {} \;
# Ensuite remplacer l'URL complète avec /data
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3000/data|${URL_BACKEND}|g" {} \;
# Enfin remplacer l'URL du frontend
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:4200|${URL_FRONTEND}|g" {} \;

# Copier un fichier après remplacement pour vérification
find /usr/share/nginx/html -type f -name "main.*.js" | head -1 | xargs -I{} cp {} /tmp/debug-backup/main.js.after

echo "✅ Variables d'environnement remplacées avec succès"
echo "Frontend URL: ${URL_FRONTEND}"
echo "Backend URL: ${URL_BACKEND}"
echo "Backend Base URL: ${URL_BACKEND%/data}"

# Afficher des exemples de chaînes pour vérification (optionnel)
echo "Exemple de vérification des remplacements:"
grep -n "${URL_BACKEND}" /tmp/debug-backup/main.js.after || echo "Aucune occurrence de ${URL_BACKEND} trouvée"

echo "🚀 Démarrage de Nginx..."
# Démarrer Nginx
exec "$@"