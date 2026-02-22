export interface TocItem {
  href: string
  label: string
  depth?: number
}

type ContentNode = {
  tag?: string
  props?: { id?: string }
  children?: ContentNode[]
  type?: string
  value?: string
}

// Извлекает текст из узла и его дочерних элементов (для заголовков).
function getTextFromNode(node: ContentNode): string {
  if (node.type === 'text' && node.value) return node.value
  if (node.children) {
    return node.children.map(getTextFromNode).join('')
  }
  return ''
}

// Генерирует id для якоря (как в Nuxt Content: нижний регистр, пробелы в дефисы).
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
}

// Рекурсивно собирает заголовки h2, h3 из body контента.
function collectHeadings(nodes: ContentNode[] | undefined, depth = 0): TocItem[] {
  if (!Array.isArray(nodes)) return []
  const items: TocItem[] = []
  for (const node of nodes) {
    const tag = node.tag?.toLowerCase()
    if (tag === 'h2' || tag === 'h3') {
      const text = getTextFromNode(node)
      const id = node.props?.id || slugify(text)
      if (text) {
        items.push({
          href: `#${id}`,
          label: text,
          depth: tag === 'h2' ? 2 : 3,
        })
      }
    }
    if (node.children?.length) {
      items.push(...collectHeadings(node.children, depth + 1))
    }
  }
  return items
}

/**
 * Строит оглавление из документа Nuxt Content.
 * docContent — результат queryContent(...).findOne().
 * prepend/append — статические пункты (страничные блоки вне MD).
 */
export function useDocToc(
  docContent: Ref<Record<string, unknown> | null>,
  options?: {
    prepend?: TocItem[]
    append?: TocItem[]
  }
) {
  const tocItems = computed<TocItem[]>(() => {
    const doc = docContent.value
    const prepend = options?.prepend ?? []
    const append = options?.append ?? []

    let fromContent: TocItem[] = []

    if (doc) {
      // Nuxt Content иногда кладёт toc в документ
      const toc = doc.toc as { links?: Array<{ id: string; text: string; depth?: number }> } | undefined
      if (toc?.links?.length) {
        fromContent = toc.links.map((link) => ({
          href: `#${link.id}`,
          label: link.text,
          depth: link.depth ?? 2,
        }))
      } else {
        // Иначе обходим body (может быть { children } или массив)
        const body = doc.body as { children?: ContentNode[] } | ContentNode[] | undefined
        const children = Array.isArray(body) ? body : body?.children
        fromContent = collectHeadings(children)
      }
    }

    return [...prepend, ...fromContent, ...append]
  })

  return { tocItems }
}
