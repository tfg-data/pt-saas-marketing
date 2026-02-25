export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  // Ensure base always ends with '/' before concatenating
  const b = base.endsWith('/') ? base : base + '/';
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `${b}${cleaned}`;
}
