# Документация API

Статическая документация по эндпоинтам API на Nuxt 3 + Nuxt Content. Данные подтягиваются из внешнего API при сборке, список страниц и навигация строятся автоматически.

## Что реализовано

- **SSG** — при `npm run generate` один запрос к API, сохранение ответа в `public/staticData/endpoints.json`, пререндер всех страниц эндпоинтов
- **Динамические маршруты** — `/docs/[section]/[path]` по данным из API (например `/docs/products/search`)
- **Навигация из API** — сайдбар с секциями и эндпоинтами, сворачиваемые блоки, плашки метода (GET/POST и т.д.), краткие описания на русском
- **Контент** — таблица «Информация о запросе», параметры тела из API, опционально Markdown из `content/docs/` (если нет — заглушка «Документация в разработке»)
- **Хлебные крошки и TOC** — динамические крошки по пути, оглавление справа

## Структура проекта

```
api-docs/
├── config/
│   └── menu-descriptions.ts   # Русские подписи секций и эндпоинтов
├── content/
│   └── docs/
│       └── products-search.md # Markdown для /docs/products/search (по желанию)
├── composables/
│   ├── useDocsNavigation.ts   # Дерево навигации из API
│   ├── useEndpoints.ts        # Загрузка данных (статический JSON или /api/endpoints)
│   └── useDocToc.ts           # Оглавление из контента
├── components/
│   ├── DocsBreadcrumbs.vue
│   ├── DocsSidebar.vue        # Секции + эндпоинты, сворачивание, описания
│   └── DocsTableOfContents.vue
├── pages/
│   ├── index.vue              # Главная → ссылка на /docs
│   └── docs/
│       ├── index.vue          # Список всех эндпоинтов
│       └── [...slug].vue      # Страница эндпоинта по slug
├── server/
│   └── api/
│       └── endpoints.ts       # Прокси к https://main.nointerest.ru/api/appload
├── public/
│   └── staticData/
│       └── endpoints.json     # Создаётся при generate из ответа appload
└── nuxt.config.ts             # Хук nitro:config — запрос к API, запись endpoints.json, роуты для prerender
```

## Запуск

```bash
npm install
npm run dev      # Разработка, данные с /api/endpoints или /staticData/endpoints.json
npm run generate # SSG: запрос к API → endpoints.json + пререндер страниц
npm run preview  # Просмотр результата generate
```

## Добавление описаний эндпоинтов на русском

В `config/menu-descriptions.ts`:

- **sectionDescriptions** — подписи секций (address_hints, auth, products, …)
- **endpointDescriptions** — подписи эндпоинтов по точному **url_name** из API (например `auth_new_otp_request`, `products_search`)

Если для эндпоинта нет ключа в `endpointDescriptions`, в меню подставляется поле `summary` из API (англ.).

## Дополнительный Markdown для эндпоинта

Файл в `content/docs/` по пути из slug через дефис: для `/docs/products/search` — `content/docs/products-search.md`. Если файла нет, на странице показывается блок «Документация в разработке», таблица запроса и параметры из API по-прежнему выводятся.

## Технологии

- Nuxt 3, Vue 3, TypeScript
- Nuxt Content (Markdown)
- Nitro (SSG, prerender, server API)
