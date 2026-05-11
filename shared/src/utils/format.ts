export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}jt`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}rb`;
  return String(count);
}
