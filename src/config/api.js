// Dónde está el backend de la cooperativa (tecno-cooperativa-backend), que
// arma el catálogo a partir de los pods con la app música. En desarrollo lo
// fija .env.development.
export const API_URL = import.meta.env.VITE_API_URL || 'https://status-tc.aebn.cl';
