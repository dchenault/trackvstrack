import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Recursively serializes Firestore data, converting Timestamps to ISO strings.
 * @param data The data to serialize.
 * @returns The serialized data.
 */
export function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  // Convert Firestore Timestamp to ISO string
  if (data.toDate && typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }

  const serialized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      serialized[key] = serializeFirestoreData(data[key]);
    }
  }

  return serialized;
}
