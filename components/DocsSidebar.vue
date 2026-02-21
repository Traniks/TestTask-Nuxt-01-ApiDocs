<template>
  <aside class="sidebar">
    <h2 class="sidebar-title">API эндпоинты</h2>
    <nav>
      <template v-for="group in groups" :key="group.id">
        <div class="nav-section">

          <NuxtLink :to="group.path" class="nav-section-link">{{ group.title }}</NuxtLink>

          <!-- Весь список секций: -->
          <ul>
            <li v-for="section in group.sections" :key="section.id" class="nav-group">
              <div class="nav-group-header">
                <button
                  type="button"
                  class="nav-group-toggle"
                  :class="{ open: isSectionOpen(section.id) }"
                  :aria-expanded="isSectionOpen(section.id)"
                  @click="toggleSection(section.id)"
                >
                  <span class="nav-group-chevron" aria-hidden="true" />
                </button>

                <NuxtLink
                  :to="sectionFirstPath(section)"
                  class="nav-group-title-wrap"
                  :class="{ active: isSectionActive(section.path) && !currentEndpoint(section) }"
                >
                  <span class="nav-group-title">{{ section.title }}</span>
                  <span v-if="section.description" class="nav-group-desc">{{ section.description }}</span>
                </NuxtLink>
              </div>

              <!-- Список эндпоинтов секции: -->
              <Transition name="nav-collapse">
                <div v-show="isSectionOpen(section.id)" class="nav-group-list-wrap">
                  <ul class="nav-group-list">
                    <li
                      v-for="endpoint in section.endpoints"
                      :key="endpoint.slug"
                      :class="{ active: isActive(endpoint.path) }"
                    >
                      <NuxtLink :to="endpoint.path" class="endpoint-link">
                        <span class="endpoint-head">
                          <span class="endpoint-title">{{ endpoint.title }}</span>
                          <span class="endpoint-method" :class="methodClass(endpoint.method)">{{ endpoint.method }}</span>
                        </span>
                        <span v-if="endpoint.description" class="endpoint-desc">{{ endpoint.description }}</span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </Transition>
            </li>
          </ul>

        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { groups } = useDocsNavigation()

/** Закрытые секции (по id); изначально все закрыты */
const closedSections = ref<Set<string>>(new Set())
const closedInitialized = ref(false)

function isSectionOpen(sectionId: string): boolean {
  return !closedSections.value.has(sectionId)
}

/** При первой загрузке групп — закрыть все секции и открыть секцию текущего роута */
watch(
  () => groups.value.flatMap((g) => g.sections.map((s) => s.id)),
  (ids) => {
    if (ids.length && !closedInitialized.value) {
      const path = route.path
      let openId: string | null = null
      for (const group of groups.value) {
        for (const section of group.sections) {
          if (path === section.path || path.startsWith(section.path + '/')) {
            openId = section.id
            break
          }
        }
      }
      closedSections.value = new Set(openId ? ids.filter((id) => id !== openId) : ids)
      closedInitialized.value = true
    }
  },
  { immediate: true }
)

/** При переходе на страницу — открыть секцию, в которой находится текущий роут */
watch(
  () => route.path,
  (path) => {
    for (const group of groups.value) {
      for (const section of group.sections) {
        if (path === section.path || path.startsWith(section.path + '/')) {
          if (closedSections.value.has(section.id)) {
            closedSections.value = new Set([...closedSections.value].filter((id) => id !== section.id))
          }
          return
        }
      }
    }
  },
  { immediate: true }
)

function toggleSection(sectionId: string): void {
  const next = new Set(closedSections.value)
  if (next.has(sectionId)) next.delete(sectionId)
  else next.add(sectionId)
  closedSections.value = next
}

const isActive = (path: string) => route.path === path

/** Секция активна (мы на странице секции или одного из её эндпоинтов) */
const isSectionActive = (sectionPath: string) => route.path === sectionPath || route.path.startsWith(sectionPath + '/')

/** Есть ли на текущем пути конкретный эндпоинт (тогда секция не подсвечивается как активная сама по себе) */
const currentEndpoint = (section: { endpoints: { path: string }[] }) =>
  section.endpoints.some((e) => e.path === route.path)

/** Ссылка секции: на первый эндпоинт или на индекс секции */
const sectionFirstPath = (section: { endpoints: { path: string }[]; path: string }) =>
  section.endpoints[0]?.path ?? section.path

function methodClass(method: string): string {
  const m = (method || 'GET').toUpperCase()
  if (m === 'GET') return 'method-get'
  if (m === 'POST') return 'method-post'
  if (m === 'PUT' || m === 'PATCH') return 'method-put'
  if (m === 'DELETE') return 'method-delete'
  return 'method-other'
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
  padding: 0;
  letter-spacing: 0.3px;
}

.nav-section-link {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  text-decoration: none;
  padding: 4px 0;
}

.nav-section-link:hover {
  color: #1976d2;
}

.sidebar h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin-bottom: 8px;
}

.sidebar a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  display: block;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.endpoint-link {
  display: block;
  min-width: 0;
}

.endpoint-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.endpoint-title {
  flex: 1;
  min-width: 0;
}

.endpoint-desc {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: #888;
  margin-top: 2px;
  line-height: 1.3;
}

.endpoint-method {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.endpoint-method.method-get {
  background: #e3f2fd;
  color: #1565c0;
}

.endpoint-method.method-post {
  background: #e8f5e9;
  color: #2e7d32;
}

.endpoint-method.method-put {
  background: #fff3e0;
  color: #e65100;
}

.endpoint-method.method-delete {
  background: #ffebee;
  color: #c62828;
}

.endpoint-method.method-other {
  background: #f5f5f5;
  color: #616161;
}

.sidebar li.active a,
.sidebar li.active .nav-group-title-wrap {
  background: #e3f2fd;
  font-weight: 500;
}

.sidebar li.active .nav-group-title,
.sidebar li.active a .endpoint-title {
  color: #1976d2;
}

.sidebar li.active .nav-group-desc {
  color: #1565c0;
  opacity: 0.9;
}

.sidebar a:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-placeholder {
  display: block;
  padding: 6px 12px;
  font-size: 14px;
  color: #999;
  font-style: italic;
}

.nav-group {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-group-header {
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-group-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #555;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}

.nav-group-toggle:hover {
  color: #333;
  background: #f5f5f5;
}

.nav-group-chevron {
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid currentColor;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transform: rotate(0deg);
  transition: transform 0.2s;
}

.nav-group-toggle.open .nav-group-chevron {
  transform: rotate(90deg);
}

.nav-group-title-wrap {
  flex: 1;
  padding: 4px 12px 4px 0;
  text-decoration: none;
  display: block;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 0;
}

.nav-group-title-wrap:hover {
  background: #f5f5f5;
}

.nav-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  display: block;
}

.nav-group-title-wrap:hover .nav-group-title {
  color: #333;
}

.nav-group-desc {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: #888;
  margin-top: 2px;
  line-height: 1.3;
}

.nav-group-title-wrap:hover .nav-group-desc {
  color: #666;
}

.nav-group-list-wrap {
  margin-left: 24px;
  overflow: hidden;
}

.nav-group-list {
  list-style: none;
  padding: 4px 0 8px 10px;
  margin: 0;
  border-left: 2px solid #e0e0e0;
}

/* Плавное открывание/закрывание списка */
.nav-collapse-enter-active,
.nav-collapse-leave-active {
  transition:
    opacity 0.25s ease,
    max-height 0.25s ease;
}

.nav-collapse-enter-from,
.nav-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.nav-collapse-enter-to,
.nav-collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}

@media (max-width: 768px) {
  .sidebar {
    position: static;
  }
}
</style>
