@echo off
ECHO Rebuilding backend container...

REM Stop the backend container
docker-compose stop backend

REM Rebuild the backend image
docker-compose build --no-cache backend

REM Restart containers
docker-compose up -d backend

ECHO.
ECHO Backend rebuilt and restarted!
ECHO You can access the API at:
FOR /F "tokens=2 delims==" %%a IN ('findstr "BACKEND_PORT" .env.docker') DO ECHO   - Backend API: http://localhost:%%a
ECHO. 