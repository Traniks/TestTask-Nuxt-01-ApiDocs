# Обновление: Nuxt 3 → 4, @nuxt/content 2 → 3

## Версии

| Пакет | Было | Стало |
|-------|------|-------|
| nuxt | 3.13 | 4.3.1 |
| @nuxt/content | 2.13.2 | 3.11.2 |
| vue | 3.4 | 3.5.28 |
| typescript | 5.3 | 5.9.3 |

## Nuxt 4 — что изменилось

### Структура каталогов

Приложение теперь живёт в `app/`:

```
app/
  app.vue
  components/
  composables/
  pages/
  config/
```

В корне остаются: `nuxt.config.ts`, `tsconfig.json`, `server/`, `content/`, `public/`.

### useAsyncData

- Первый аргумент (key) — только строка, не функция: `useAsyncData('my-key', fetcher)`.
- `data` по умолчанию `undefined` вместо `null`.
- `getCachedData` получает `(key, nuxtApp, ctx)` вместо просто `(key)`. Вместо `useNuxtData(key).data.value` используется `nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]`.

## @nuxt/content 3 — что изменилось

### SQL-хранилище

Контент хранится в SQLite (через `better-sqlite3`). Это новая обязательная зависимость.

### Коллекции вместо произвольных запросов

Конфигурация контента переехала из `nuxt.config.ts` в отдельный `content.config.ts`:

```ts
import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
    }),
  },
})
```

Секция `content` в `nuxt.config.ts` больше не нужна.

### Новый Query API

| v2 | v3 |
|----|-----|
| `queryContent('/docs').find()` | `queryCollection('docs').all()` |
| `queryContent(path).findOne()` | `queryCollection('docs').path(path).first()` |
| `doc._path` | `doc.path` |

### TOC

В v2 TOC лежал в корне документа (`doc.toc.links`). В v3 он внутри body: `doc.body.toc.links`. Каждый элемент — `{ id, text, depth }`.

Вложенность `children` у TOC-ссылок убрана — все заголовки в плоском списке с полем `depth`.
