/**
 * YouTube Runtime Cache
 *
 * Легковесный in-memory runtime cache: Map<trackId, videoId>.
 *
 * Цель:
 *   — не выполнять повторный YouTube search для одного track
 *     в рамках одной frontend session.
 *
 * Ограничения (by design):
 *   — НЕ использует Redis, localStorage, DB, TTL, invalidation.
 *   — Живёт только в памяти — сбрасывается при перезагрузке страницы.
 */

const cache = new Map<string, string>();

/**
 * Получить закешированный videoId для trackId.
 * Возвращает undefined если трек ещё не искали.
 */
export function getCachedVideoId(trackId: string): string | undefined {
  return cache.get(trackId);
}

/**
 * Сохранить videoId в runtime cache.
 */
export function setCachedVideoId(trackId: string, videoId: string): void {
  cache.set(trackId, videoId);
}

/**
 * Проверить, есть ли videoId в кеше для данного trackId.
 */
export function hasCachedVideoId(trackId: string): boolean {
  return cache.has(trackId);
}

/**
 * Размер кеша (для debug).
 */
export function cacheSize(): number {
  return cache.size;
}

/**
 * Очистить кеш (например, при сбросе сессии).
 */
export function clearCache(): void {
  cache.clear();
}
