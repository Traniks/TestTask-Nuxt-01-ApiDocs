/** Прокси appload; при generate не используется (данные из staticData). */
const APPLOAD_URL = 'https://main.nointerest.ru/api/appload'
const APPLOAD_BODY = {
  detalize_mode: 'full',
  ignore_cache: false,
}

let cached: unknown = null

export default defineEventHandler(async () => {
  if (cached) {
    return cached
  }
  const response = await fetch(APPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(APPLOAD_BODY),
  })
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    })
  }
  const data = await response.json()
  cached = data
  return data
})
