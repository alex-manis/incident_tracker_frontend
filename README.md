# Incident Tracker Frontend

React приложение для системы отслеживания инцидентов.

## Технологии

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios

## Установка

```bash
pnpm install
```

## Настройка

Настройте API URL в `src/lib/api.ts` если backend работает на другом порту/домене.

По умолчанию используется прокси через Vite (см. `vite.config.ts`).

## Запуск

```bash
# Разработка
pnpm dev

# Сборка
pnpm build

# Превью продакшн сборки
pnpm preview
```

## Структура проекта

```
src/
├── main.tsx           # Точка входа
├── App.tsx            # Главный компонент
├── pages/             # Страницы
├── components/         # Компоненты
├── contexts/          # React контексты
└── lib/               # Утилиты (API клиент)
```

## Маршруты

- `/login` - Страница входа
- `/dashboard` - Дашборд со статистикой
- `/incidents` - Список инцидентов
- `/incidents/new` - Создание инцидента
- `/incidents/:id` - Детали инцидента

## Зависимости

Проект использует общий пакет `@incident-tracker/shared` для типов и схем. Убедитесь, что он доступен в workspace или установлен отдельно.

## Переменные окружения

Создайте `.env` файл при необходимости:

```env
VITE_API_URL=http://localhost:3001
```
