import { isNil } from 'lodash';

export function enumToArray<T extends object>(enumeration: T): T[keyof T][] {
  return Object.keys(enumeration)
    .filter(key => Number.isNaN(Number(key)))
    .map(key => enumeration[key as keyof T])
    .filter(val => typeof val === 'number' || typeof val === 'string');
}

export function filterUndefined<T>(array: (T | null)[]): T[] {
  return array.filter(val => !isNil(val)) as T[];
}
