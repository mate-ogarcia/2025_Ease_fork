@echo off
ECHO Lancement de Docker Compose avec le fichier .env.docker...

IF NOT EXIST .env.docker (
  ECHO Erreur: Le fichier .env.docker n'a pas ete trouve.
  EXIT /B 1
)

REM Variable pour savoir si Couchbase existe déjà
SET COUCHBASE_EXISTS=0

REM Vérifier si le conteneur Couchbase existe déjà et est configuré
docker inspect couchbase >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  ECHO Le conteneur Couchbase existe déjà, préservation des données...
  REM Arrêt des autres conteneurs seulement
  docker-compose stop frontend backend nginx-proxy
  SET COUCHBASE_EXISTS=1
) ELSE (
  ECHO Premier démarrage ou Couchbase non trouvé, préparation d'une configuration complète...
  REM Arrêt des conteneurs precedents si necessaire
  docker-compose down
)

REM Demarrage des nouveaux conteneurs
docker-compose --env-file .env.docker up -d

REM Si erreur, essayer de reconstruire
IF %ERRORLEVEL% NEQ 0 (
  ECHO Une erreur s'est produite. Tentative de reconstruction forcee...
  docker-compose --env-file .env.docker build --no-cache
  docker-compose --env-file .env.docker up -d
)

ECHO.
ECHO Services demarres:
docker-compose ps
ECHO.

ECHO.
ECHO.

REM Afficher les instructions en fonction de si Couchbase existe déjà ou non
IF %COUCHBASE_EXISTS% EQU 1 (
  ECHO Couchbase est déjà configuré. Les données ont été préservées.
  ECHO Vous pouvez accéder à la console d'administration Couchbase:
  FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PORT" .env.docker') DO ECHO   - Couchbase Admin: http://localhost:%%a
  ECHO.
  ECHO Vous pouvez vous connecter au frontend:
  FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
  ECHO.
) ELSE (
  ECHO Dans un premier temps, veuillez vous connecter à la base de données Couchbase:
  FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PORT" .env.docker') DO ECHO   - Couchbase Admin: http://localhost:%%a
  ECHO.
  ECHO Vous pouvez vous connecter en créant un nouveau cluster, rentrer les informations demandées et laisser la config du cluster par défaut.
  ECHO Ensuite dans security, créez un utilisateur avec les droits nécessaires en utilisant les informations suivantes:
  FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_USER" .env.docker') DO ECHO   - User: %%a
  FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PASSWORD" .env.docker') DO ECHO   - Password: %%a
  ECHO Il faut aussi lui ajouter les droits administrateur sur le cluster. /!\
  ECHO Si vous utilisez ces identifiants et mdp vous pourrez connecter le backend et la BDD facilement, sinon voir le readme.
  ECHO.
  ECHO Lancer la commande suivante pour finaliser la configuration:
  ECHO python bucketsJSON/importBuckets.py
  ECHO.
  ECHO Une fois que le cluster est configuré, vous pouvez vous connecter au frontend:
  FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
  ECHO.
)