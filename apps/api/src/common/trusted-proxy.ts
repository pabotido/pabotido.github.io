export function parseTrustedProxyCidrs(value: string | undefined): string[] {
  return (value ?? '').split(',').map((cidr) => cidr.trim()).filter(Boolean);
}
