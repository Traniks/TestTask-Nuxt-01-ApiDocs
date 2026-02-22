/** endpoints.json (SSG) или /api/endpoints (dev). */
export function useEndpoints() {
  const fetcher = async () => {
    try {
      return await $fetch<unknown>('/staticData/endpoints.json')
    } catch {
      return await $fetch<unknown>('/api/endpoints')
    }
  }
  return useAsyncData('api-endpoints', fetcher, {
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  })
}
