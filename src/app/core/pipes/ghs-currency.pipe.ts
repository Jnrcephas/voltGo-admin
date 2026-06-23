import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Ghanaian Cedi currency, e.g. `1234.5` -> `GHS 1,234.50`.
 * Used in place of manually concatenating `'GHS ' + (value | number)` across
 * templates so formatting stays consistent.
 */
@Pipe({
  name: 'ghs',
  standalone: true,
})
export class GhsCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showDecimals = false): string {
    if (value === null || value === undefined || value === '') return 'GHS 0';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) return 'GHS 0';

    const formatted = num.toLocaleString('en-GH', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    return `GHS ${formatted}`;
  }
}
