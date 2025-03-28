#!/bin/bash

#!/bin/bash

echo "Attente du démarrage de Couchbase..."
until curl -s http://localhost:8091/ui/index.html > /dev/null; do
    echo "Couchbase n'est pas encore prêt, attente..."
    sleep 5
done

echo "Couchbase est prêt, lancement de l'initialisation..."

# Ajoute ici le reste de tes commandes d'initialisation

# Créer un cluster (si nécessaire)
curl -u ${COUCHBASE_ADMINISTRATOR_USERNAME}:${COUCHBASE_ADMINISTRATOR_PASSWORD} -X POST http://localhost:8091/node/controller/setupServices \
    -d "services=data,index,query,fts" \
    -d "clusterName=MyCluster"

# Configurer le mot de passe administrateur
curl -u ${COUCHBASE_ADMINISTRATOR_USERNAME}:${COUCHBASE_ADMINISTRATOR_PASSWORD} -X POST http://localhost:8091/settings/web \
    -d "username=${COUCHBASE_ADMINISTRATOR_USERNAME}" \
    -d "password=${COUCHBASE_ADMINISTRATOR_PASSWORD}"

# Créer les buckets en fonction des données existantes (par exemple UsersBDD, ProductsBDD)
curl -u ${COUCHBASE_ADMINISTRATOR_USERNAME}:${COUCHBASE_ADMINISTRATOR_PASSWORD} -X POST http://localhost:8091/pools/default/buckets \
    -d name=UsersBDD \
    -d ramQuotaMB=100 \
    -d replicaNumber=1

curl -u ${COUCHBASE_ADMINISTRATOR_USERNAME}:${COUCHBASE_ADMINISTRATOR_PASSWORD} -X POST http://localhost:8091/pools/default/buckets \
    -d name=ProductsBDD \
    -d ramQuotaMB=100 \
    -d replicaNumber=1

# Chargement des données existantes dans Couchbase
echo "Chargement des données dans Couchbase..."
curl -u ${COUCHBASE_ADMINISTRATOR_USERNAME}:${COUCHBASE_ADMINISTRATOR_PASSWORD} -X POST http://localhost:8091/pools/default/buckets/UsersBDD/docs \
    -d file=@/opt/couchbase/var/data/UsersBDD_export.json

# Vous pouvez répéter cette étape pour d'autres buckets si nécessaire.

echo "Cluster et données Couchbase initialisés avec succès."
