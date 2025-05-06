@echo off
ECHO Starting Docker Compose with .env.docker file...

IF NOT EXIST .env.docker (
  ECHO Error: The .env.docker file was not found.
  EXIT /B 1
)

REM Variable to check if Couchbase already exists
SET COUCHBASE_EXISTS=0
SET COUCHBASE_VOLUME_EXISTS=0

REM Check if Couchbase container already exists
docker inspect couchbase >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  SET COUCHBASE_EXISTS=1
)

REM Check if Couchbase volume already exists
docker volume inspect projetcapg_couchbase_data >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  SET COUCHBASE_VOLUME_EXISTS=1
)

REM Decide action based on existence
IF %COUCHBASE_EXISTS% EQU 1 (
  IF %COUCHBASE_VOLUME_EXISTS% EQU 1 (
    ECHO Couchbase container and its data already exist in the volume, preserving...
    docker-compose stop frontend backend nginx-proxy
    ECHO If you didn't have containers before, you can run the command to create buckets:
    ECHO python bucketsJSON/importBuckets.py
    ECHO.
  ) ELSE (
    ECHO Couchbase container exists but its data volume has been deleted.
    ECHO A new configuration will be required.
    docker-compose down
    ECHO.
    ECHO.
  )
) ELSE (
  IF %COUCHBASE_VOLUME_EXISTS% EQU 1 (
    ECHO Couchbase volume exists but the container has been removed.
    ECHO Data will be preserved.
    docker-compose stop frontend backend nginx-proxy
  ) ELSE (
    ECHO First startup or Couchbase completely removed.
    ECHO A new configuration will be required.
    docker-compose down
  )
)

REM Start new containers
docker-compose --env-file .env.docker up -d

REM If error, try to rebuild
IF %ERRORLEVEL% NEQ 0 (
  ECHO An error occurred. Attempting forced rebuild...
  docker-compose --env-file .env.docker build --no-cache
  docker-compose --env-file .env.docker up -d
)

ECHO.
ECHO Services started:
docker-compose ps
ECHO.

ECHO.
ECHO.

REM Check again if the volume exists after startup
docker volume inspect projetcapg_couchbase_data >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  REM Check if it's a new volume or an existing one
  IF %COUCHBASE_VOLUME_EXISTS% EQU 1 (
    ECHO Couchbase is already configured. Data has been preserved.
    ECHO You can access the Couchbase admin console:
    FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PORT" .env.docker') DO ECHO   - Couchbase Admin: http://localhost:%%a
    ECHO.
    ECHO You can connect to the frontend:
    FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
    ECHO.
  ) ELSE (
    ECHO First, please connect to the Couchbase database:
    FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PORT" .env.docker') DO ECHO   - Couchbase Admin: http://localhost:%%a
    ECHO.
    ECHO You can connect by creating a new cluster, enter the requested information and leave the cluster config as default.
    ECHO Then in security, create a user with the necessary rights using the following information:
    FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_USER" .env.docker') DO ECHO   - User: %%a
    FOR /F "tokens=2 delims==" %%a IN ('findstr "DB_PASSWORD" .env.docker') DO ECHO   - Password: %%a
    ECHO You must also add administrator rights to the cluster for this user. /!\
    ECHO If you use these credentials you can easily connect the backend and the database, otherwise see the readme.
    ECHO.
    ECHO Run the following command to finalize the configuration:
    ECHO python bucketsJSON/importBuckets.py
    ECHO.
    ECHO Once the cluster is configured, you can connect to the frontend:
    FOR /F "tokens=2 delims==" %%a IN ('findstr "FRONTEND_PORT" .env.docker') DO ECHO   - Frontend: http://localhost:%%a
    ECHO.
  )
) ELSE (
  ECHO Error: The Couchbase volume was not created correctly.
  ECHO Check Docker logs for more information.
)