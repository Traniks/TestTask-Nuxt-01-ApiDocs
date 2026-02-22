<template>
  <div class="docs-container">
    <div class="docs-layout">

      <DocsSidebar />

      <main class="main-content">

        <DocsBreadcrumbs :items="[{ label: 'Документация', active: true }]" />

        <div class="stub-content">
          <h1>Документация API</h1>
          <p>Выберите эндпоинт из списка.</p>

          <template v-for="group in groups" :key="group.id">
            <section v-for="section in group.sections" :key="section.id" class="endpoint-section">
              <h2 class="section-title">{{ section.title }}</h2>
              <ul class="endpoint-list">
                <li v-for="endpoint in section.endpoints" :key="endpoint.slug">
                  <NuxtLink :to="endpoint.path">{{ endpoint.title }}</NuxtLink>
                </li>
              </ul>
            </section>
          </template>

          <p v-if="!hasEndpoints" class="no-endpoints">Загрузка списка эндпоинтов...</p>
        </div>
      </main>

      <aside class="toc-placeholder" />
      
    </div>
  </div>
</template>

<script setup lang="ts">
const { groups } = useDocsNavigation()
const hasEndpoints = computed(() => groups.value.some((g) => g.sections.some((s) => s.endpoints.length > 0)))
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

.stub-content {
  margin-top: 20px;
}

.stub-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.stub-content p {
  color: #555;
  margin-bottom: 24px;
  line-height: 1.6;
}

.endpoint-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e0e0;
}

.endpoint-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.endpoint-list li {
  margin-bottom: 8px;
}

.endpoint-list a {
  color: #1976d2;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.endpoint-list a:hover {
  text-decoration: underline;
}

.no-endpoints {
  color: #888;
  font-style: italic;
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
