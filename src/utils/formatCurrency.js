// Currency formatting helper for INR / standard currency
export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceUnit(price, unit = 'day') {
  return `${formatCurrency(price)} / ${unit}`;
}
