// Environnement de développement (utilise localhost)
const BASE_URL = 'https://two025-ease-fork.onrender.com';

console.log(`🔧 Environnement de DÉVELOPPEMENT chargé avec BASE_URL: ${BASE_URL}`);

export const environment = {
  production: false,
  backendUrl: `${BASE_URL}/data`,
  searchUrl: `${BASE_URL}/request-handler/search`,
  productsURL: `${BASE_URL}/products`,
  globalBackendUrl: BASE_URL,
  authBackendUrl: `${BASE_URL}/auth`,
  databaseBackendURL: `${BASE_URL}/database`,
  offUrl: `${BASE_URL}/openFoodFacts`,
  apiCountrieUrl: `${BASE_URL}/apiCountries`,
  apiUnsplashUrl: `${BASE_URL}/unsplash`,
};  
