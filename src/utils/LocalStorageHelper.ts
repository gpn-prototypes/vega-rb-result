import { LocalStorageKey } from '@app/constants/LocalStorageKeyConstants';

/**
 * Хелпер для работы с localstorage
 */
export namespace LocalStorageHelper {
  /** Получение данных по ключу */
  export function get(key: LocalStorageKey): string | null {
    return localStorage.getItem(key);
  }

  /** Установка данных по ключу */
  export function set(key: LocalStorageKey, value: string): void {
    localStorage.setItem(key, value);
  }

  /** Получение parsed данных по ключу */
  export function getParsed<T>(key: LocalStorageKey): T {
    return JSON.parse(localStorage.getItem(key) || '');
  }

  /** Установка parsed данных по ключу */
  export function setParsed<T>(key: LocalStorageKey, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
