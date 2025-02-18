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

### Installation Steps

#### Clone the Repository

```sh
git clone <https://github.com/CapgePau-Uppa/2025_Ease.git>
cd <2025_Ease>
```

#### Install Dependencies

Navigate to both the frontend and backend directories and install the required dependencies:

```sh
cd frontend
npm install
cd ../backend
npm install
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

### Start the Frontend

Run the following command inside the frontend directory:

```sh
ng serve
```

This will start the Angular application.

### Start the Backend

Run the following command inside the backend directory:

```sh
npm run start:prod
```

This will launch the backend server in production mode, if you want to launch it in development mode you have to run the following command:

```sh
npm run start:dev
```

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
