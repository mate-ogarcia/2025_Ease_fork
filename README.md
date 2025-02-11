# 2025_Ease


🛠️ Workflow du Moteur de Recherche

1️⃣ L'utilisateur tape un produit (ex: "Acer Nitro") dans la barre de recherche.
2️⃣ Le backend vérifie si le produit et ses alternatives sont déjà en cache (Redis).

    ✅ Si oui, on récupère directement les résultats et on les affiche immédiatement.
    ❌ Sinon, une requête est envoyée à la base de données pour :
        Trouver les informations du produit.
        Exécuter un algorithme pour trouver les alternatives européennes.
        Stocker les résultats en cache Redis pour la prochaine fois.
        3️⃣ Les résultats sont affichés sur la page :
    À gauche → Le produit recherché.
    À droite → Les alternatives européennes.