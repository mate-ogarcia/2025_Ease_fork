@echo off
ECHO Rebuilding frontend container...

REM Stop the frontend container
docker-compose stop frontend nginx-proxy

REM Rebuild the frontend image
docker-compose build --no-cache frontend

REM Restart containers
docker-compose up -d frontend nginx-proxy

ECHO.
ECHO Frontend rebuilt and restarted!
ECHO You can access it at:
FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
ECHO   - Interface via nginx-proxy: http://localhost:8081
ECHO. 