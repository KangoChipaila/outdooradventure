/**
 * Format a number as Zambian Kwacha.
 * e.g. 4588.99 → "K 4,588.99"
 */
export function formatZMW(amount: number): string {
  return (
    "K " +
    amount.toLocaleString("en-ZM", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
