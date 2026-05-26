export function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!apiUrl) return '';
  return apiUrl.replace(/\/api\/?$/, '');
}

