# 2025_Ease

## Project Explanation

This project aims to create a website where you can search for non-European brands and receive alternative European brands. This can help promote European brands and encourage local consumption, which can have beneficial effects on the environment.

### Features

On our website, you can:

- Search for a brand/category or products and receive alternative European brands/products similar to those you've searched for,
- Suggest a product/brand you think is a good alternative,
- Rate the alternative to give other users product advice.

## Project Setup Guide

### Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (latest LTS version recommended)
- **Angular CLI** (for the frontend)
- **Git** (to clone the repository)
- **CouchBase** (if you want to run the project in development mode)
- **Python** (for running data import scripts)
- **Docker** and **Docker Compose** (for containerized deployment)

### Installation Steps

#### Clone the Repository

```sh
git clone <https://github.com/CapgePau-Uppa/2025_Ease.git>
cd <2025_Ease>
```

#### Install Dependencies

Navigate to the root of your directory and install the required dependencies:

```sh
npm run install:all
```

#### Environment Configuration

1. Create the following environment files at the project root:
   - `.env.development` for development mode
   - `.env.production` for production mode
   - `.env.docker` for Docker deployment

2. Configure the environment variables in each file according to your setup. Required variables include:
   - Database connection details
   - API endpoints
   - Authentication credentials
   - Port configurations

3. If necessary, modify the `\2025_Ease\backend\src\main.ts` file to adapt it to your .env file:

```sh
// Load the right .env
const envFile = path.resolve(
  __dirname,
  "../../.env." + (process.env.NODE_ENV || "development")
);
dotenv.config({ path: envFile });
console.log(`🚀 Running in ${process.env.NODE_ENV} mode`);
```

#### Couchbase
1. for the production mode :

    As far as production mode is concerned, you don't need to install anything as you'll be accessing the deployed database, just make sure that in your `.env.production` all your variables are correct.

2. for development mode :

    For development mode, you need to install couchbase, create your server, bucket and index.

    - To install couchbase locally, go to this url: `https://www.couchbase.com/downloads/?family=couchbase-server` and install the couchbase serve community (the free one).
    - Once installed, log in, follow the steps and create a server (the server itself isn't very important, but make sure you remember your access codes).
    - Create a user (make sure it's an admin user, and note the login ID - it's very important).
    - Create all the buckets you need, making sure that the names of the buckets you've just created match those of your `.env.development`.
    - Create your index on your bucket products

  #### Note:

  - Make sur all your variables in your `.env.development` match those in your couchbase database, including the bucket's name and index's name. 
  - For development mode, the `DB_HOST` of the `.env` must be the IP of the machine hosting couchbase (if you're local then you must put your IP).
  - /!\ If you can't connect to the database, check that you don't have a VPN. CouchBase prevents connection if you have one, so use a private connection such as your connection share or a personal Wifi.

## Starting the Project

You have several options for launching the project, depending on your needs and workflow.

### Option 1: Launch the Entire Project via the Global package.json

This method allows you to start both the frontend and the backend from a single terminal. To do this, navigate to the root directory of the project and run:

```sh
npm run start:prod
```

### Option 2: Launch the Frontend and Backend in Separate Terminals

This approach is especially suitable for development mode and offers greater flexibility.

1. Starting the Frontend

    Open a terminal, navigate to the frontend folder, and run:

    ```sh
    ng serve
    ```

2. Starting the Backend

    Open another terminal, navigate to the backend folder, and choose one of the following commands:

    To start in development mode:
    ```sh
    npm run start:dev
    ```

    To start in production mode:
      ```sh
      npm run start:prod
      ```

    #### Notes:
    You can launch the project components either via the global `package.json` or by using the specific scripts in the frontend and backend folders, depending on which method suits you best.
    In this case, you may need to take a look at each `package.json` to find out which script to run according to your needs (in the `package.json` files, look for the `scripts` section).

### Additional Notes

- Ensure that all dependencies are properly installed before starting the applications.
- Make sure that the `.env.production` file contains all required environment variables for the backend.
- If any issues arise, check the logs and ensure that the ports used by both frontend and backend are not occupied.
- Sometimes, you'll get an error message saying:

```sh
NOTE: Raw file sizes do not reflect development server per-request transformations.
An unhandled exception occurred: EBUSY: resource busy or locked, rmdir 'your_path\ProjetTutore_CapG\frontend\.angular\cache\19.1.5\frontend\vite\deps_ssr'
See "your_path\AppData\Local\Temp\ng-RHFVO8\angular-errors.log" for further details.
```

To solve this problem, you need to go to this folder `your_path\ProjetTutore_CapG\frontend\.angular\cache\19.1.5\frontend\vite\` and delete it. You can delete the entire `\vite\` folder, or just the `deps_ssr` and `deps` files, depending on the error message you have.

# Docker Deployment Guide

This section explains how to deploy the complete application (frontend, backend, and Couchbase) using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Project Structure for Docker

```
projetCapG/
├── backend/                # NestJS Application
├── frontend/               # Angular Application
├── bucketsJSON/            # Couchbase initialization scripts and data
├── .env.docker            # Environment variables for Docker
├── docker-compose.yml     # Docker Compose configuration
├── nginx-proxy.conf       # Nginx reverse proxy configuration
└── README.md              # This file
```

## Configuration

All environment variables are defined in the `.env.docker` file at the project root. If you want to modify parameters (ports, bucket names, etc.), you can edit this file.

## Docker Architecture

The Docker deployment uses a multi-container architecture:

1. **Couchbase**: Database server
2. **Backend**: NestJS application running on port 3001
3. **Frontend**: Angular application served by Nginx on port 80 within the container
4. **Nginx Proxy**: Reverse proxy that routes requests between the frontend and backend

The communication flow is:
- Browser → Nginx Proxy (port 8081) → Frontend or Backend
- Frontend container communicates with Backend through relative URLs (e.g., `/api/...`)
- Nginx Proxy routes all `/api/` requests to the Backend service

## Starting the Project with Docker

The application startup with Docker follows a precise sequence to ensure proper configuration:

### Step 1: Start Couchbase

```
docker compose up -d couchbase
```

This command only starts the Couchbase container, accessible at http://localhost:8091.

### Step 2: Configure Couchbase

1. **Access the Couchbase Administration Interface**:
   - Open your browser at http://localhost:8091
   - If the interface doesn't appear immediately, refresh the page or try again in a few seconds
   - The Couchbase initialization screen will appear

2. **Configure a New Cluster**:
   - Follow the setup wizard to create a new cluster
   - The cluster name is not important
   - Configure the memory allocation based on your system resources
   - Accept the default terms and services

3. **Create an Administrator User**:
   - In the Security tab, create a new user with administrator rights
   - Use the following credentials:
     - Username: `user1`
     - Password: `password`
   - Make sure to select "Full Administrator" role for this user
   - This step is critical as the backend will use these credentials to connect to Couchbase

### Step 3: Initialize Buckets and Import Data

```
docker compose up -d couchbase-init
```

This command starts the initialization container that will automatically create all necessary buckets and import sample data. You'll see the buckets appear in the "Buckets" tab of the Couchbase interface after a few seconds.

The initialization creates the bucket UsersBDD with two default users with the following roles to try the different role in the site easily:

- **SuperAdmin**:
  - Email: capgSuperadmin@gmail.com
  - Password: capgSuperadminPass

- **Admin**:
  - Email: capgAdmin@gmail.com
  - Password: capgAdminPass

You can create a user with the "User" role if needed (roles must be modified directly in the database).

### Step 4: Start the Rest of the Application

```
docker compose up -d backend frontend nginx-proxy
```

This command starts the remaining services: backend, frontend, and Nginx proxy. Once completed, you can access the application at http://localhost:8081.

## Accessing Services

Once the containers are started, you can access the following services:

- **Frontend (via proxy)**: http://localhost:8081
- **Backend API**: http://localhost:3001
- **Couchbase Admin Interface**: http://localhost:8091
  - Default credentials: user1 / password

## Creating Indexes (if needed)

Once buckets are created and data is imported, you can create indexes to optimize searches:

- In the Couchbase Admin interface:
  - Go to the "Search" tab
  - Click on "Add Index"
  - Name your index (e.g., "IndexTest")
  - Select the "ProductsBDD" bucket as the data source
  - In the "Type Mapping" options:
    - Add fields to index one by one: category, FK_Brands, name, status, tags, description
    - For each field, select the "text" type
  - In the "Index Settings" options:
    - Check the options for French language
    - Enable the first 4 indexing options (default, standard, keyword, simple)
  - Click "Create Index" to finalize

## Stopping Containers

To stop all containers without removing them:

```
docker-compose stop
```

To stop and remove containers (Couchbase data will be preserved in the volume):

```
docker-compose down
```

To completely remove all containers and volumes (caution: this will delete all Couchbase data):

```
docker-compose down -v
```

## Troubleshooting

If you encounter issues with Docker setup:

1. **Check container logs**:

2. **Verify Couchbase is properly configured**:
   - Make sure you've created the admin user with correct permissions
   - Check that all required buckets were created
   - Confirm the data import script ran successfully

3. **Frontend/Backend connection issues**:
   - The frontend container uses environment files optimized for Docker: `environment.docker.ts`
   - This ensures all API calls use relative paths (`/api/...`) instead of absolute URLs
   - The Nginx proxy (nginx-proxy.conf) routes these requests to the backend

4. **Reset everything and start fresh**:

   Then follow steps 1 to 4 from the "Starting the Project with Docker" section again.

## Important Notes About Couchbase Configuration

### Persistence of Couchbase Configuration

Couchbase configuration is persistent across Docker restarts due to the volume defined in the docker-compose.yml file:

```yaml
volumes:
  couchbase_data:
    driver: local
```

This means:

- **You only need to configure Couchbase once**. The configuration will persist across container restarts and even after running `docker-compose down` (as long as you don't delete the volume).

- **If you run `docker-compose down -v`**, this will delete the volume and you will need to reconfigure Couchbase from scratch according to the manual configuration steps above.

- **If you modify bucket names or structure** in your application, you will need to manually update the Couchbase configuration to match these changes.

This is precisely why we've opted for a manual configuration approach - once configured, Couchbase will work correctly without additional intervention during normal restarts.

### When to Reconfigure Couchbase

You only need to reconfigure Couchbase in the following scenarios:

1. After executing `docker-compose down -v` (which removes all volumes)
2. If you delete the `couchbase_data` volume manually
3. If you change bucket names or structure in your application
4. If you're setting up the application on a new machine

In all other cases, including regular application restarts with the Docker command sequence, your Couchbase configuration will remain intact.
