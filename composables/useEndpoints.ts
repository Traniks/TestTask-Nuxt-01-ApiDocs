/**
 * Загрузка данных эндпоинтов (ответ appload).
 * При generate данные лежат в public/staticData/endpoints.json — сначала пробуем их.
 * В dev или если файла нет — fallback на /api/endpoints.
 */
export function useEndpoints() {
  const fetcher = async () => {
    try {
      return await $fetch<unknown>('/staticData/endpoints.json')
    } catch {
      return await $fetch<unknown>('/api/endpoints')
    }
  }
  return useAsyncData('api-endpoints', fetcher, {
    getCachedData: (key) => useNuxtData(key).data.value,
  })
}
