<template>
  <div class="app" @mousedown="handleOutsideClick">
    <header class="header">
      <NuxtLink to="/" class="header-logo">Документация API</NuxtLink>
      
      <div class="header-search" ref="searchContainer">
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          class="search-input"
          placeholder="Поиск по документации..."
          aria-label="Поиск по документации"
          autocomplete="off"
          @focus="isOpen = true"
          @keydown="onKeydown"
        />

        <SearchDropdown
          v-if="showDropdown"
          :items="results"
          :loading="searchIndexPending"
          v-model="selectedIndex"
          @select="onSelect"
        />
      </div>
    </header>

    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
const { query, results, isOpen, showDropdown, searchIndexPending } = useSearch()
const selectedIndex = ref(-1)
const searchContainer = ref(null)
const searchInput = ref(null)

watch(results, () => {
  selectedIndex.value = -1
})

function onKeydown(e) {
  if (!isOpen.value || !results.value.length) {
    if (e.key === 'Escape') {
      isOpen.value = false
      searchInput.value?.blur()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const len = results.value.length
    selectedIndex.value = len ? (selectedIndex.value + 1) % len : -1
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const len = results.value.length
    selectedIndex.value = len ? (selectedIndex.value <= 0 ? len - 1 : selectedIndex.value - 1) : -1
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (selectedIndex.value >= 0 && selectedIndex.value < results.value.length) {
      onSelect(results.value[selectedIndex.value])
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
    searchInput.value?.blur()
  }
}

function onSelect(item) {
  isOpen.value = false
  query.value = ''
  navigateTo(item.path)
}

function handleOutsideClick(e) {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    isOpen.value = false
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background: #ffffff;
}

a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 24px;
  background: #1a1a2e;
  color: #fff;
}

.header-logo {
  font-weight: 700;
  font-size: 18px;
  color: #fff;
}

.header-logo:hover {
  text-decoration: none;
  opacity: 0.9;
}

.header-search {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #16213e;
  color: #fff;
  outline: none;
}

.search-input::placeholder {
  color: #888;
}

.search-input:focus {
  border-color: #667eea;
}

.main {
  flex: 1;
}
</style>
