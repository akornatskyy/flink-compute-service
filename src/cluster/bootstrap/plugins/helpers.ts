export function configOverrides(
  config?: Record<string, string | number>,
): string {
  if (!config) {
    return '';
  }

  return Object.entries(config)
    .map(([key, value]) => `-D ${key}=${value}`)
    .join(' ');
}
