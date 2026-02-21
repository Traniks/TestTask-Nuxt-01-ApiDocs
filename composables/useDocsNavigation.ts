/**
 * Динамическая навигация по документации из API (appload).
 * Строит дерево: группы → секции → эндпоинты из page_data.unauth.paths.
 */
import { sectionDescriptions, endpointDescriptions } from '~/config/menu-descriptions'

export interface DocEndpoint {
  slug: string
  title: string
  path: string
  method: string
  /** Краткое описание для меню (рус. из конфига или summary из API) */
  description: string
}

export interface DocSection {
  id: string
  title: string
  path: string
  /** Краткое описание секции на русском */
  description: string
  endpoints: DocEndpoint[]
}

export interface DocNavGroup {
  id: string
  title: string
  path: string
  sections: DocSection[]
}

type ApiPaths = Record<string, Record<string, { url_name?: string; methods?: string[]; summary?: string }>>

function humanize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

/** Название эндпоинта для меню: без дублирования секции; _ → / только если в path несколько сегментов */
function endpointMenuTitle(sectionId: string, urlName: string | undefined, pathKey: string): string {
  const pathPart = pathKey.replace(/^\//, '')
  const raw = urlName ?? pathPart.replace(/\//g, '_')
  const prefix = sectionId + '_'
  const withoutSection = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw
  const hasMultipleSegments = pathPart.includes('/')
  return hasMultipleSegments ? withoutSection.replace(/_/g, '/') : withoutSection
}

export function useDocsNavigation() {
  const { data: apiData } = useEndpoints()

  const groups = computed<DocNavGroup[]>(() => {
    const raw = apiData.value as { page_data?: { unauth?: { paths?: ApiPaths } } } | null
    const paths = raw?.page_data?.unauth?.paths
    if (!paths || typeof paths !== 'object') return []

    const sections: DocSection[] = []
    for (const [sectionId, sectionPaths] of Object.entries(paths)) {
      if (!sectionPaths || typeof sectionPaths !== 'object') continue
      const endpoints: DocEndpoint[] = []
      for (const [pathKey, endpoint] of Object.entries(sectionPaths)) {
        const path = pathKey.startsWith('/') ? pathKey : `/${pathKey}`
        const fullPath = `/docs/${sectionId}${path}`
        const urlName = endpoint?.url_name ?? path.replace(/^\//, '').replace(/\//g, '_')
        endpoints.push({
          slug: urlName,
          title: endpointMenuTitle(sectionId, endpoint?.url_name, path),
          path: fullPath,
          method: endpoint?.methods?.[0] ?? 'GET',
          description: endpointDescriptions[urlName] ?? endpoint?.summary ?? '',
        })
      }
      if (endpoints.length) {
        sections.push({
          id: sectionId,
          title: humanize(sectionId),
          path: `/docs/${sectionId}`,
          description: sectionDescriptions[sectionId] ?? '',
          endpoints,
        })
      }
    }

    if (!sections.length) return []
    return [
      {
        id: 'unauth',
        title: 'Неавторизованные',
        path: '/docs',
        sections,
      },
    ]
  })

  return { groups }
}
