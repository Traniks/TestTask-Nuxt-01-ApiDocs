<template>
  <div class="docs-container">
    <div class="docs-layout">
      <DocsSidebar />
      <main class="main-content">
        <DocsBreadcrumbs :items="breadcrumbItems" />

        <div v-if="pending && !apiDataRaw" class="state-message">Загрузка...</div>
        <div v-else-if="errorMessage && !apiDataRaw" class="state-message state-error">{{ errorMessage }}</div>

        <template v-else-if="apiData">
          <!-- Request Information Table -->
          <div class="request-info" id="request-information">
            <h2>Информация о запросе</h2>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">Метод</td>
                  <td class="value">{{ apiData.methods?.[0] ?? '—' }}</td>
                </tr>
                <tr>
                  <td class="label">Адрес</td>
                  <td class="value">{{ apiData.target }}</td>
                </tr>
                <tr>
                  <td class="label">Тип формы</td>
                  <td class="value">{{ apiData.forms?.[0]?.form_type ?? '—' }}</td>
                </tr>
                <tr>
                  <td class="label">Имя в URL</td>
                  <td class="value">{{ apiData.url_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Markdown Content или заглушка -->
          <div class="markdown-content">
            <ContentRenderer v-if="docContent" :value="docContent" />
            <p v-else class="doc-stub">Документация в разработке</p>
          </div>

          <!-- Справка: параметры тела запроса -->
          <div class="parameters-section" id="request-body-parameters">
            <details class="parameters-details">
              <summary class="parameters-summary">
                <span class="parameters-summary-title">Справка: параметры тела запроса</span>
                <span class="parameters-summary-hint">типы полей, обязательность, допустимые значения</span>
              </summary>
              <div class="parameters-content">
                <div class="parameters-table-wrap">
                  <table class="parameters-table">
                    <thead>
                      <tr>
                        <th>Параметр</th>
                        <th>Тип</th>
                        <th>Обязательность</th>
                        <th>Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(fieldData, fieldName) in apiData.forms?.[0]?.form_data"
                        :key="String(fieldName)"
                        class="parameter-row"
                      >
                        <td class="col-name">
                          <code class="parameter-name">{{ fieldName }}</code>
                        </td>
                        <td class="col-type">
                          <span class="parameter-type">{{ fieldData.form_class }}</span>
                        </td>
                        <td class="col-required">
                          <span :class="fieldData.required ? 'required-badge' : 'optional-badge'">
                            {{ fieldData.required ? 'обязательный' : 'опционально' }}
                          </span>
                        </td>
                        <td class="col-description">
                          <p class="parameter-description">{{ fieldData.label }}</p>
                          <div v-if="fieldData.options?.length" class="parameter-options">
                            <strong>Допустимые значения:</strong>
                            <ul>
                              <li v-for="option in fieldData.options" :key="option.value">
                                <code>{{ option.value }}</code> — {{ option.key?.ru || option.key?.en }}
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          </div>

        </template>
      </main>
      <DocsTableOfContents :items="tocItems" />
    </div>
  </div>
</template>

<script setup lang="ts">

interface ApiEndpoint {
  url_name: string
  target: string
  methods?: string[]
  forms?: Array<{ form_type?: string; form_data?: Record<string, { form_class?: string; label?: string; required?: boolean; options?: Array<{ value: string; key?: { ru?: string; en?: string } }> }> }>
}

const route = useRoute()

const slug = computed(() => {
  const p = route.params.slug
  if (Array.isArray(p)) return p.filter(Boolean)
  if (typeof p === 'string') return p ? p.split('/').filter(Boolean) : []
  return []
})

const slugPath = computed(() => (Array.isArray(slug.value) ? slug.value.join('/') : slug.value) || '')
const contentPath = computed(() => '/docs/' + (Array.isArray(slug.value) ? slug.value.join('-') : slug.value || ''))

const { data: apiDataRaw, pending, error } = await useEndpoints()

const section = computed(() => slug.value[0] ?? '')
const path = computed(() => '/' + (slug.value.slice(1).join('/') || ''))

const apiData = computed(() => {
  const raw = apiDataRaw.value as { page_data?: { unauth?: { paths?: Record<string, Record<string, ApiEndpoint>> } } } | null
  if (!raw?.page_data?.unauth?.paths || !section.value) return null
  return raw.page_data.unauth.paths[section.value]?.[path.value] ?? null
})

const errorMessage = computed(() => {
  if (error.value) return error.value.message || 'Ошибка загрузки данных'
  if (!pending.value && slug.value.length && !apiData.value) return 'Эндпоинт не найден'
  return null
})

const { data: docContent } = await useAsyncData(
  () => `doc-${contentPath.value}`,
  () => queryContent(contentPath.value).findOne()
)

const { tocItems } = useDocToc(docContent, {
  prepend: [{ href: '#request-information', label: 'Информация о запросе' }],
  append: [{ href: '#request-body-parameters', label: 'Справка: параметры тела запроса' }],
})

function humanizeSegment(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

const breadcrumbItems = computed(() => {
  const items: Array<{ label: string; href?: string; active?: boolean }> = [
    { label: 'Документация', href: '/docs' },
  ]
  const parts = slug.value
  if (!parts.length) return items
  parts.forEach((segment, i) => {
    const isLast = i === parts.length - 1
    const href = '/docs/' + parts.slice(0, i + 1).join('/')
    const label = isLast
      ? (apiData.value?.url_name ?? humanizeSegment(segment))
      : humanizeSegment(segment)
    items.push(isLast ? { label, active: true } : { label, href })
  })
  return items
})
</script>

<style scoped>
.docs-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.docs-layout {
  display: grid;
  grid-template-columns: 250px 1fr 200px;
  gap: 40px;
}

.main-content {
  min-width: 0;
}

.state-message {
  padding: 24px;
  text-align: center;
  color: #666;
}

.state-error {
  color: #c62828;
}

.request-info {
  margin-top: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.request-info h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #c5c5c5;
}

.info-table tr {
  border-bottom: 1px solid #c5c5c5;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table td {
  padding: 12px 16px;
  border-right: 1px solid #c5c5c5;
}

.info-table td:last-child {
  border-right: none;
}

.info-table .label {
  font-weight: 600;
  color: #555;
  width: 150px;
  background: #f0f0f0;
}

.info-table .value {
  color: #333;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.markdown-content {
  margin-bottom: 32px;
}

.doc-stub {
  color: #666;
  font-style: italic;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.markdown-content :deep(h1) {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.markdown-content :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

.markdown-content :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #444;
}

.markdown-content :deep(p) {
  line-height: 1.7;
  color: #555;
  margin-bottom: 16px;
}

.markdown-content :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #d63384;
}

.markdown-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
  border: 1px solid #c5c5c5;
  border-radius: 4px;
  overflow: hidden;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  padding: 10px 14px;
  border: 1px solid #c5c5c5;
  text-align: left;
}

.markdown-content :deep(table th) {
  font-weight: 600;
  color: #333;
  background: #f0f0f0;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background: #fafafa;
}

.parameters-section {
  margin-top: 32px;
}

.parameters-details {
  border: 1px solid #c5c5c5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.parameters-summary {
  list-style: none;
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  user-select: none;
  transition: background 0.2s;
}

.parameters-summary::-webkit-details-marker {
  display: none;
}

.parameters-summary::before {
  content: '';
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 6px solid #666;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  margin-right: 10px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.parameters-details[open] .parameters-summary::before {
  transform: rotate(90deg);
}

.parameters-summary:hover {
  background: #f0f0f0;
}

.parameters-summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.parameters-summary-hint {
  font-size: 13px;
  color: #666;
}

.parameters-content {
  border-top: 1px solid #e0e0e0;
}

.parameters-table-wrap {
  overflow-x: auto;
}

.parameters-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.parameters-table th {
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
  background: #f0f0f0;
  border: 1px solid #c5c5c5;
}

.parameters-table td {
  padding: 6px 8px;
  border: 1px solid #c5c5c5;
  vertical-align: top;
}

.parameters-table tr:first-child th,
.parameters-table tr:first-child td {
  border-top: none;
}

.parameters-table tr:last-child td {
  border-bottom: none;
}

.parameters-table th:first-child,
.parameters-table td:first-child {
  border-left: none;
}

.parameters-table th:last-child,
.parameters-table td:last-child {
  border-right: none;
}

.parameters-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.col-name {
  width: 140px;
}

.col-type {
  width: 160px;
}

.col-required {
  width: 120px;
}

.parameter-name {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.parameter-type {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.optional-badge {
  font-size: 12px;
  color: #555;
  background: #e8e8e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}

.required-badge {
  font-size: 12px;
  color: #c62828;
  background: #ffebee;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  display: inline-block;
}

.parameter-description {
  color: #555;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.parameter-options {
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.parameter-options strong {
  color: #333;
  font-size: 13px;
  display: block;
  margin-bottom: 6px;
}

.parameter-options ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.parameter-options li {
  padding: 4px 0;
  color: #555;
  font-size: 13px;
}

.parameter-options code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #d63384;
  margin-right: 6px;
}

.toc-placeholder {
  min-width: 0;
}

@media (max-width: 1200px) {
  .docs-layout {
    grid-template-columns: 200px 1fr;
  }
}

@media (max-width: 768px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
}
</style>
