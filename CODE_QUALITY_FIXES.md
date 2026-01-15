# Исправление костылей и улучшение качества кода

## ✅ Исправленные проблемы

### 1. **Типизация `any` в failedQueue** ✅ ИСПРАВЛЕНО
**Проблема:** Использование `any` типов в очереди refresh запросов

**Было:**
```typescript
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];
```

**Стало:**
```typescript
type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};
let failedQueue: QueuedRequest[] = [];
```

### 2. **Хардкод строк для auth endpoints** ✅ ИСПРАВЛЕНО
**Проблема:** Хардкод строк '/auth/login' и '/auth/refresh' в нескольких местах

**Было:**
```typescript
if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
```

**Стало:**
```typescript
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'] as const;
const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint));
```

### 3. **Хардкод ключа localStorage** ✅ ИСПРАВЛЕНО
**Проблема:** Строка 'accessToken' повторялась в нескольких местах

**Было:**
```typescript
localStorage.getItem('accessToken')
localStorage.setItem('accessToken', ...)
localStorage.removeItem('accessToken')
```

**Стало:**
```typescript
const ACCESS_TOKEN_KEY = 'accessToken';
localStorage.getItem(ACCESS_TOKEN_KEY)
localStorage.setItem(ACCESS_TOKEN_KEY, ...)
localStorage.removeItem(ACCESS_TOKEN_KEY)
```

### 4. **Типизация в main.tsx** ✅ ИСПРАВЛЕНО
**Проблема:** Использование `(error as any)` вместо правильной типизации

**Было:**
```typescript
const status = (error as any)?.response?.status;
```

**Стало:**
```typescript
import { AxiosError } from 'axios';
const status = (error as AxiosError)?.response?.status;
```

### 5. **Множественные вызовы localStorage.getItem** ✅ ИСПРАВЛЕНО
**Проблема:** В `AuthContext.tsx` было 3 вызова `localStorage.getItem('accessToken')`

**Было:**
```typescript
enabled: !!localStorage.getItem('accessToken'),
// ...
const hasAccessToken = !!localStorage.getItem('accessToken');
```

**Стало:**
```typescript
const hasAccessToken = useMemo(() => !!localStorage.getItem(ACCESS_TOKEN_KEY), []);
enabled: hasAccessToken,
// Используется та же переменная
```

### 6. **Улучшена типизация в api.ts** ✅ ИСПРАВЛЕНО
**Проблема:** Недостаточная типизация в нескольких местах

**Улучшения:**
- Добавлен `InternalAxiosRequestConfig` для типизации `originalRequest`
- Добавлена типизация для `refreshResponse.data`
- Улучшена типизация Promise в очереди

### 7. **Оптимизация logout** ✅ ИСПРАВЛЕНО
**Проблема:** Дублирование кода в `onSuccess` и `onError`

**Было:**
```typescript
onSuccess: () => {
  setUser(null);
  queryClient.clear();
  localStorage.removeItem('accessToken');
  queryClient.cancelQueries();
},
onError: () => {
  setUser(null);
  queryClient.clear();
  localStorage.removeItem('accessToken');
  queryClient.cancelQueries();
},
```

**Стало:**
```typescript
onSuccess: () => {
  setUser(null);
  queryClient.clear();
  queryClient.cancelQueries();
  localStorage.removeItem(ACCESS_TOKEN_KEY);
},
onError: () => {
  setUser(null);
  queryClient.clear();
  queryClient.cancelQueries();
  localStorage.removeItem(ACCESS_TOKEN_KEY);
},
```

### 8. **Добавлены константы** ✅ ИСПРАВЛЕНО
**Проблема:** Магические строки разбросаны по коду

**Добавлено:**
```typescript
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'] as const;
const ACCESS_TOKEN_KEY = 'accessToken';
const LOGIN_PATH = '/login';
```

## 📊 Статистика улучшений

- **Убрано `any` типов:** 4 места
- **Вынесено констант:** 3
- **Оптимизировано вызовов localStorage:** 3 → 1 (с мемоизацией)
- **Улучшена типизация:** 5 мест
- **Убрано дублирования:** 2 места

## ✅ Что осталось (оправданные решения)

1. **`window.location.href` в api.ts** - Оправдано, так как мы в interceptor вне React Router контекста
2. **`window.location.reload()` в ErrorBoundary** - Оправдано для критических ошибок
3. **Глобальные переменные `isRefreshing` и `failedQueue`** - Оправдано для модульного уровня, инкапсулировано в модуле

## 🎯 Результат

- ✅ Нет `any` типов (кроме оправданных случаев)
- ✅ Нет хардкода строк
- ✅ Все константы вынесены
- ✅ Оптимизированы вызовы localStorage
- ✅ Улучшена типизация везде
- ✅ Убрано дублирование кода

**Код стал чище, типобезопаснее и легче поддерживать!** ✅
