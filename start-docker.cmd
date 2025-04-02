@echo off
ECHO Lancement de Docker Compose avec le fichier .env.docker...

IF NOT EXIST .env.docker (
  ECHO Erreur: Le fichier .env.docker n'a pas ete trouve.
  EXIT /B 1
)

REM Arrêt des conteneurs precedents si necessaire
docker-compose down

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
ECHO Vous pouvez acceder a:
FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
FOR /F "tokens=2 delims==" %%a IN ('findstr "BACKEND_PORT" .env.docker') DO ECHO   - Backend API: http://localhost:%%a/data
FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PORT" .env.docker') DO ECHO   - Couchbase Admin: http://localhost:%%a
FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_USER" .env.docker') DO SET DB_USER=%%a
FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PASSWORD" .env.docker') DO SET DB_PASSWORD=%%a
ECHO     Identifiants Couchbase: %DB_USER% / %DB_PASSWORD% 
