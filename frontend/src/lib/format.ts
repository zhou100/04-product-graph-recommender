export function formatPrice(
  price: number | null,
  fallback: string | null = null,
): string | null {
  if (price === null) return fallback;
  return `$${price.toFixed(2)}`;
}
