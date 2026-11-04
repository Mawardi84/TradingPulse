export function formatInstrumentPrice(
  price: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const formattedNum = price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (currency === 'IDR') {
    return `Rp${formattedNum}`;
  }
  if (currency === 'JPY') {
    return `¥${formattedNum}`;
  }
  return `$${formattedNum}`;
}
