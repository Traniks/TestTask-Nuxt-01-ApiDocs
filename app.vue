<template>
  <div class="app">
    <header class="header">
      <NuxtLink to="/" class="header-logo">Документация API</NuxtLink>
      <div class="header-search">
        <input
          type="search"
          class="search-input"
          placeholder="Поиск по документации..."
          aria-label="Поиск по документации"
        />
      </div>
    </header>

    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

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
