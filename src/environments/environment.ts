export const environment = {
  // En desarrollo, /api se proxifica a http://localhost:8080 con reescritura
  // (/api/x -> /x), ver proxy.conf.json.
  // En producción, configura un rewrite equivalente o una URL absoluta del backend.
  apiUrl: '/api',
};
