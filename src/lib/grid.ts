export type GridColumns = '1' | '2' | '3';

export const GRID_COLUMN_OPTIONS: readonly GridColumns[] = ['1', '2', '3'];

export function gridClass(columns: GridColumns): string {
  if (columns === '1') return 'grid grid-cols-1 gap-5';
  if (columns === '3') return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';
  return 'grid grid-cols-1 sm:grid-cols-2 gap-5';
}

export function gridImageSizes(columns: GridColumns): string {
  if (columns === '1') return '100vw';
  if (columns === '3') return '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
  return '(min-width: 640px) 50vw, 100vw';
}
