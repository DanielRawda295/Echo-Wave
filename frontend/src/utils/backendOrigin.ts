export function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!apiUrl) return '';
  return apiUrl.replace(/\/api\/?$/, '');
}

export function getMediaUrl(path: string | undefined, backendOrigin = getBackendOrigin()): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith('/') || path.startsWith('//')) return undefined;
  return `${backendOrigin}${path}`;
}

