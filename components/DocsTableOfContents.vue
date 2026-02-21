<template>
  <aside class="toc">
    <h3>Содержание</h3>
    <nav>
      <ul>
        <li v-for="item in items" :key="item.href">
          <a :href="item.href">{{ item.label }}</a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
export interface TocItem {
  href: string
  label: string
}

defineProps<{
  items: TocItem[]
}>()
</script>

<style scoped>
.toc {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.toc h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc li {
  /* margin-bottom: 8px; */
}

.toc a {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  display: block;
  padding: 4px 0;
  transition: color 0.2s;
}

.toc a:hover {
  color: #1976d2;
}

@media (max-width: 1200px) {
  .toc {
    display: none;
  }
}
</style>
