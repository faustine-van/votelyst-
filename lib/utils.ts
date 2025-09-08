import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAnonId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  let anonId = localStorage.getItem('anon_id');
  if (!anonId) {
    anonId = uuidv4();
    localStorage.setItem('anon_id', anonId);
  }
  return anonId;
};