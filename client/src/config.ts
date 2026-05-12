/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

// Add console.log for debugging
console.log('API_URL:', API_URL);

export { API_URL }; 