# Настройка деплоя на Render.com для Frontend

## Настройки для Render.com

В панели управления вашего Frontend сервиса (Static Site) на Render.com укажите следующие настройки:

### Build Command:
```bash
corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm build
```

### Publish Directory:
```
dist
```

### Root Directory:
Оставьте **пустым** (так как репозиторий уже содержит только frontend код)

### Environment Variables:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

(Замените `your-backend-url` на реальный URL вашего backend сервиса)

## После настройки

1. Сохраните изменения
2. Render автоматически запустит новый деплой
3. Проверьте логи - должны увидеть успешную установку pnpm и сборку

## Проверка работоспособности

После успешного деплоя откройте URL вашего статического сайта - должна открыться страница входа.
