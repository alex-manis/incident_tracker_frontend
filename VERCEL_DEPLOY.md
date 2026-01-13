# Деплой Frontend на Vercel

## Автоматический деплой

Vercel автоматически определяет Vite проект и настраивает деплой. Просто подключите репозиторий к Vercel.

## Настройки в Vercel Dashboard

### Environment Variables:

Добавьте переменную окружения:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

(Замените `your-backend-url` на реальный URL вашего backend сервиса на Render)

### Build Settings:

Vercel автоматически определит:
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (или `pnpm build` если настроен)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (или `pnpm install`)

## Менеджер пакетов

Проект использует npm для деплоя на Vercel (Vercel имеет лучшую поддержку npm из коробки).

Локальная зависимость `file:./shared` работает корректно с npm.

## Проверка работоспособности

После успешного деплоя:
1. Откройте URL вашего Vercel проекта
2. Должна открыться страница входа
3. Проверьте, что API запросы идут на правильный backend URL

## CORS настройки

Убедитесь, что в backend на Render настроен CORS для вашего Vercel домена:
- `FRONTEND_URL` должен содержать ваш Vercel URL (например: `https://your-app.vercel.app`)
