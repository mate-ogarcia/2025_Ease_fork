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

#### Import the Environment File

Place the `.env.production` file at the project root (place your .env file where the `.env.sample` file is). If necessary, you may need to modify this part of the `\2025_Ease\backend\src\main.ts` file to adapt it to your .env file:

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

    Make sur all your variables in your `.env.development` match those in your couchbase database, including the bucket's name and index's name.

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

    #### Note:
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
