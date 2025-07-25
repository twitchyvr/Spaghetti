import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for combining class names with clsx
 * This is commonly used in React components for conditional styling
 * 
 * @param inputs - Class values to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}