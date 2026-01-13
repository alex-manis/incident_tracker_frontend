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

## Настройка для pnpm

Проект настроен на использование pnpm. Файл `.npmrc` уже создан и настроен автоматически.

Если нужно вручную:
1. В настройках проекта добавьте переменную окружения:
   ```
   PNPM_VERSION=latest
   ```

2. Или убедитесь, что файл `.npmrc` содержит:
   ```
   package-manager=pnpm
   ```

## Проверка работоспособности

После успешного деплоя:
1. Откройте URL вашего Vercel проекта
2. Должна открыться страница входа
3. Проверьте, что API запросы идут на правильный backend URL

## CORS настройки

Убедитесь, что в backend на Render настроен CORS для вашего Vercel домена:
- `FRONTEND_URL` должен содержать ваш Vercel URL (например: `https://your-app.vercel.app`)
