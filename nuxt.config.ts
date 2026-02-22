export default defineNuxtConfig({
  compatibilityDate: '2026-02-22',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  hooks: {
    async 'nitro:config'(nitroConfig) {
      const proc = globalThis && (globalThis as { process?: { env?: { NODE_ENV?: string }; argv?: string[] } }).process
      const isGenerate = proc?.argv?.includes('generate') ?? false
      const isProduction = proc?.env?.NODE_ENV === 'production'

      if (isProduction || isGenerate) {
        console.log('🔄 Генерация списка роутов для SSG из API...')

        try {
          const response = await fetch('https://main.nointerest.ru/api/appload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detalize_mode: 'full', ignore_cache: false }),
          })
          const data = await response.json()

          const { writeFileSync, mkdirSync } = await import('node:fs')
          const { join } = await import('node:path')
          const outDir = join(process.cwd(), 'public', 'staticData')
          mkdirSync(outDir, { recursive: true })
          writeFileSync(join(outDir, 'endpoints.json'), JSON.stringify(data, null, 2), 'utf-8')
          console.log('✅ Ответ appload сохранён в public/staticData/endpoints.json')

          const paths = data?.page_data?.unauth?.paths ?? {}
          const docsRoutes = ['/docs']

          for (const section of Object.keys(paths)) {
            for (const pathKey of Object.keys(paths[section])) {
              const routePath = `/docs/${section}${pathKey}`
              if (!routePath.includes('{')) {
                docsRoutes.push(routePath)
              }
            }
          }

          console.log(`✅ Роуты для prerender: ${docsRoutes.length} (включая /docs)`)
          nitroConfig.prerender = nitroConfig.prerender || {}
          nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
          nitroConfig.prerender.routes.push(...docsRoutes)
        } catch (err) {
          console.error('❌ Ошибка генерации роутов:', err)
        }

      }

    },
  },
})
