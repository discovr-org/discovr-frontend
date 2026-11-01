/** Indian digit grouping. Symbol before the number. No decimals unless present. */
export function formatPrice(amountInRupees: number): string {
  const hasPaise = !Number.isInteger(amountInRupees);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  }).format(amountInRupees);

  return `₹${formatted}`;
}
