export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  // BASE_URL ends with '/', path may start with '/'
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleaned}`;
}
