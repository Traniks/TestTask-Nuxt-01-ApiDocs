<template>
  <div class="search-dropdown">
    <div v-if="loading" class="search-message">Загрузка...</div>
    <div v-else-if="!items.length" class="search-message">Ничего не найдено</div>

    <template v-else>
      <div v-if="endpoints.length" class="search-group">
        <div class="search-group-label">Эндпоинты</div>

        <div
          v-for="(item, i) in endpoints"
          :key="'ep-' + i"
          class="search-item"
          :class="{ highlighted: item._index === modelValue }"
          @mousedown.prevent="$emit('select', item)"
          @mouseenter="$emit('update:modelValue', item._index)"
        >

          <span v-if="item.method" class="search-method" :class="methodClass(item.method)">{{ item.method }}</span>
          <span v-else class="search-icon">#</span>
          <span class="search-item-body">
            <span class="search-item-title">{{ item.title }}</span>
            <span v-if="item.description" class="search-item-desc">{{ item.description }}</span>
          </span>
        </div>
      </div>

      <div v-if="headings.length" class="search-group">
        <div class="search-group-label">Разделы документации</div>

        <div
          v-for="(item, i) in headings"
          :key="'hd-' + i"
          class="search-item"
          :class="{ highlighted: item._index === modelValue }"
          @mousedown.prevent="$emit('select', item)"
          @mouseenter="$emit('update:modelValue', item._index)"
        >

          <span class="search-icon">#</span>
          <span class="search-item-body">
            <span class="search-item-title">{{ item.title }}</span>
            <span v-if="item.description" class="search-item-desc">{{ item.description }}</span>
          </span>
        </div>
      </div>
    </template>
    
  </div>
</template>

<script setup lang="ts">
import type { SearchItem } from '~/composables/useSearch'

interface IndexedItem extends SearchItem {
  _index: number
}

const props = withDefaults(
  defineProps<{
    items: SearchItem[]
    modelValue: number
    loading?: boolean
  }>(),
  { loading: false }
)

defineEmits<{
  select: [item: SearchItem]
  'update:modelValue': [index: number]
}>()

const indexedItems = computed<IndexedItem[]>(() =>
  props.items.map((item, i) => ({ ...item, _index: i })),
)

const endpoints = computed(() => indexedItems.value.filter((i) => i.type === 'endpoint'))
const headings = computed(() => indexedItems.value.filter((i) => i.type === 'heading'))

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
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #16213e;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.search-message {
  padding: 12px 16px;
  font-size: 13px;
  color: #888;
}

.search-group {
  padding: 4px 0;
}

.search-group + .search-group {
  border-top: 1px solid #334155;
}

.search-group-label {
  padding: 6px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-item:hover,
.search-item.highlighted {
  background: #1e2d4a;
}

.search-method {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

.search-method.method-get {
  background: #1e3a5f;
  color: #64b5f6;
}

.search-method.method-post {
  background: #1b3a2a;
  color: #81c784;
}

.search-method.method-put {
  background: #3e2a0f;
  color: #ffb74d;
}

.search-method.method-delete {
  background: #3e1515;
  color: #ef9a9a;
}

.search-method.method-other {
  background: #2a2a3e;
  color: #b0b0c0;
}

.search-icon {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  width: 24px;
  text-align: center;
  margin-top: 1px;
}

.search-item-body {
  flex: 1;
  min-width: 0;
}

.search-item-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-desc {
  display: block;
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
</style>
