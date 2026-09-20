/**
 * Health Risk AI - API Client Configuration
 * Dynamic backend API base URL supporting local development and production deployments (e.g. Cloudflare).
 */
const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.DEV
    ? 'http://localhost:5000'
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
};

export const API_BASE_URL = getDefaultApiUrl().replace(/\/+$/, '');

if (typeof window !== 'undefined') {
  console.info(`[HealthRisk AI] Active API Base URL: ${API_BASE_URL}`);
}
