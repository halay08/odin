/**
 *
 * @param currencyCode
 * @param currencyTotal
 */
export function createCurrencyString(currencyCode: string, currencyTotal: number): string {
  return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode || 'GBP' }).format(
    currencyTotal);
};
