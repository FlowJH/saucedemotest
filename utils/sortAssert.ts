export function isStringArraySorted(values: string[], order: 'asc' | 'desc'): boolean {
  const sortedValues = [...values].sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
  return JSON.stringify(values) === JSON.stringify(sortedValues);
}

export function isNumberArraySorted(values: number[], order: 'asc' | 'desc'): boolean {
  const sortedValues = [...values].sort((a, b) => (order === 'asc' ? a - b : b - a));
  return JSON.stringify(values) === JSON.stringify(sortedValues);
}
