export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) {
    return 'Ksh 0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('KES', 'Ksh');
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day} / ${month} / ${year}`;
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

export function getMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}
