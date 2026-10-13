import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase();
}

export function smartIncludes(source: string | null | undefined, query: string | null | undefined): boolean {
  if (!query || !query.trim()) return true;
  if (!source) return false;
  return removeVietnameseTones(source).includes(removeVietnameseTones(query));
}
