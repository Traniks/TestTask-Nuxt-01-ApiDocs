<template>
  <nav class="breadcrumbs">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" class="breadcrumbs-sep">›</span>

      <NuxtLink
        v-if="item.href && !item.active"
        :to="item.href"
        class="breadcrumbs-item breadcrumbs-link"
      >
        {{ item.label }}
      </NuxtLink>
      
      <span
        v-else
        :class="['breadcrumbs-item', { 'breadcrumbs-active': item.active }]"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.breadcrumbs {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  padding: 10px 0;
}

.breadcrumbs-sep {
  margin: 0 8px;
  color: #999;
}

.breadcrumbs-item {
  color: #666;
}

.breadcrumbs-link {
  color: #1976d2;
  text-decoration: none;
}

.breadcrumbs-link:hover {
  text-decoration: underline;
}

.breadcrumbs-item.breadcrumbs-active {
  color: #333;
  font-weight: 500;
}
</style>
