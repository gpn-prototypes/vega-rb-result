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

  /**
   * Получение parsed данных по ключу
   * @deprecated
   *
   * Используем getPureParsed, ибо этот метод не всегда корректно возвращает нужный тип
   */
  export function getParsed<T>(key: LocalStorageKey): T {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  /** Получение parsed данных по ключу */
  export function getPureParsed<T>(key: LocalStorageKey): T | undefined {
    const localStorageItem = localStorage.getItem(key);

    if (!localStorageItem) {
      return undefined;
    }

    return JSON.parse(localStorageItem);
  }

  /** Установка parsed данных по ключу */
  export function setParsed<T>(key: LocalStorageKey, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
