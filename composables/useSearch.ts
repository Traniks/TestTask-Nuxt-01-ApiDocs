import { endpointDescriptions, sectionDescriptions } from '~/config/menu-descriptions'

export interface SearchItem {
  title: string
  description: string
  path: string
  type: 'endpoint' | 'heading'
  method?: string
}

type ApiPaths = Record<string, Record<string, { url_name?: string; methods?: string[]; summary?: string }>>

function humanize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

function endpointMenuTitle(sectionId: string, urlName: string | undefined, pathKey: string): string {
  const pathPart = pathKey.replace(/^\//, '')
  const raw = urlName ?? pathPart.replace(/\//g, '_')
  const prefix = sectionId + '_'
  const withoutSection = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw
  const hasMultipleSegments = pathPart.includes('/')
  return hasMultipleSegments ? withoutSection.replace(/_/g, '/') : withoutSection
}

function buildSearchItemsFromApi(raw: unknown): SearchItem[] {
  const data = raw as { page_data?: { unauth?: { paths?: ApiPaths } } } | null
  const paths = data?.page_data?.unauth?.paths
  if (!paths || typeof paths !== 'object') return []
  const items: SearchItem[] = []
  for (const [sectionId, sectionPaths] of Object.entries(paths)) {
    if (!sectionPaths || typeof sectionPaths !== 'object') continue
    const sectionDesc = sectionDescriptions[sectionId] ?? ''
    for (const [pathKey, endpoint] of Object.entries(sectionPaths)) {
      const path = pathKey.startsWith('/') ? pathKey : `/${pathKey}`
      const fullPath = `/docs/${sectionId}${path}`
      const urlName = endpoint?.url_name ?? path.replace(/^\//, '').replace(/\//g, '_')
      items.push({
        title: endpointMenuTitle(sectionId, endpoint?.url_name, path),
        description: endpointDescriptions[urlName] ?? endpoint?.summary ?? sectionDesc,
        path: fullPath,
        type: 'endpoint',
        method: endpoint?.methods?.[0] ?? 'GET',
      })
    }
  }
  return items
}

export function useSearch() {
  // ref, не useState — при navigateTo() payload не перезаписывает состояние
  const query = ref('')
  const isOpen = ref(false)
  const searchIndexPending = ref(true)
  const fetchedEndpoints = ref<SearchItem[]>([])
  const headingItems = ref<SearchItem[]>([])

  const { groups } = useDocsNavigation()

  if (import.meta.client) {
    $fetch<unknown>('/staticData/endpoints.json')
      .then((raw) => {
        fetchedEndpoints.value = buildSearchItemsFromApi(raw)
      })
      .catch(() => {})
      .finally(() => {
        searchIndexPending.value = false
      })

    queryContent('/docs').find()
      .then((docs) => {
        const items: SearchItem[] = []
        for (const doc of docs) {
          const docPath = doc._path || ''
          const docTitle = (doc.title as string) || ''

          if (docTitle) {
            items.push({
              title: docTitle,
              description: 'Документация',
              path: docPath,
              type: 'heading',
            })
          }

          const toc = doc.toc as { links?: Array<{ id: string; text: string; depth?: number; children?: Array<{ id: string; text: string; depth?: number }> }> } | undefined
          if (toc?.links) {
            for (const link of toc.links) {
              items.push({
                title: link.text,
                description: docTitle || 'Документация',
                path: `${docPath}#${link.id}`,
                type: 'heading',
              })
              if (link.children) {
                for (const child of link.children) {
                  items.push({
                    title: child.text,
                    description: `${docTitle} — ${link.text}`,
                    path: `${docPath}#${child.id}`,
                    type: 'heading',
                  })
                }
              }
            }
          }
        }
        headingItems.value = items
      })
      .catch(() => {})
  }

  const endpointItems = computed<SearchItem[]>(() => {
    if (fetchedEndpoints.value.length > 0) return fetchedEndpoints.value
    const items: SearchItem[] = []
    for (const group of groups.value) {
      for (const section of group.sections) {
        for (const ep of section.endpoints) {
          items.push({
            title: ep.title,
            description: ep.description || section.title,
            path: ep.path,
            type: 'endpoint',
            method: ep.method,
          })
        }
      }
    }
    return items
  })

  const allItems = computed<SearchItem[]>(() => [
    ...endpointItems.value,
    ...headingItems.value,
  ])

  const results = computed<SearchItem[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (q.length < 2) return []

    const matched = allItems.value.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q),
    )

    matched.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aExact = aTitle === q
      const bExact = bTitle === q
      if (aExact !== bExact) return aExact ? -1 : 1
      const aInTitle = aTitle.includes(q)
      const bInTitle = bTitle.includes(q)
      if (aInTitle !== bInTitle) return aInTitle ? -1 : 1
      return 0
    })

    return matched.slice(0, 10)
  })

  const showDropdown = computed(() => {
    const q = query.value.trim()
    return isOpen.value && (results.value.length > 0 || q.length >= 2)
  })

  return { query, results, isOpen, showDropdown, searchIndexPending }
}
