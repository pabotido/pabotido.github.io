export function resolveWebOrigin(appUrl: string | undefined): string {
  const value = appUrl?.trim() || 'http://localhost:3000';
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('APP_URL must be an HTTP(S) origin without a path');
  }

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.pathname !== '/' ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    throw new Error('APP_URL must be an HTTP(S) origin without a path');
  }

  return parsed.origin;
}
