/**
 * Health Risk AI - API Client Configuration
 * Dynamic backend API base URL supporting local development and production deployments (e.g. Render).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
