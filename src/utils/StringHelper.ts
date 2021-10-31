/** Форматирования числа, добавление пробелов для тысячных */
export function getNumberWithSpaces(value: string): string {
  const parts = value.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return parts.join('.');
}
