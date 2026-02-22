<template>
  <div class="home-container">
    <div class="hero">
      <h1>Документация API</h1>
      <p>Документация по API эндпоинтам</p>
      <NuxtLink to="/docs" class="btn-primary">
        Открыть документацию
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  text-align: center;
  color: white;
  padding: 40px;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero p {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.btn-primary {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
