# Руководство по миграции и улучшениям

## 🎯 Быстрые исправления (уже сделаны)

✅ Исправлена критическая ошибка с `window.location.href` в `IncidentsPage.tsx`
✅ Убран `@ts-ignore` в `AuthContext.tsx`, добавлена правильная типизация
✅ Добавлена типизация для `auditLogs` в `IncidentDetailPage.tsx`

## 📦 Новые компоненты (готовы к использованию)

### 1. Layout компонент
**Файл:** `src/components/layout/Layout.tsx`

**Использование:**
```typescript
import { Layout } from '../components/layout/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      {/* Ваш контент */}
    </Layout>
  );
}
```

**Миграция:**
1. Импортируйте `Layout` в каждую страницу
2. Оберните контент в `<Layout>`
3. Удалите дублированный header код

### 2. UI компоненты
**Файлы:**
- `src/components/ui/Button.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/ui/ErrorMessage.tsx`

**Использование:**
```typescript
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

// Button
<Button variant="primary" onClick={handleClick}>Click me</Button>
<Button variant="danger" disabled>Delete</Button>

// LoadingSpinner
{isLoading && <LoadingSpinner />}

// ErrorMessage
{error && <ErrorMessage error={error} />}
```

### 3. Error Boundary
**Файл:** `src/components/ErrorBoundary.tsx`

**Использование в `main.tsx`:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

### 4. useDebounce hook
**Файл:** `src/hooks/useDebounce.ts`

**Использование в `IncidentsPage.tsx`:**
```typescript
import { useDebounce } from '../hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Используйте debouncedSearch в queryKey вместо search
const { data, isLoading } = useQuery({
  queryKey: queryKeys.incidents.list({ ...filters, search: debouncedSearch, page }),
  // ...
});
```

## 🔄 Пошаговая миграция страниц

### Шаг 1: DashboardPage
```typescript
// До
export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header>...</header>
      <main>...</main>
    </div>
  );
}

// После
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useQuery({...});

  if (error) return <ErrorMessage error={error} />;

  return (
    <Layout>
      <h2>Dashboard</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        // Ваш контент
      )}
    </Layout>
  );
}
```

### Шаг 2: IncidentsPage
1. Добавить `useDebounce` для поиска
2. Обернуть в `Layout`
3. Добавить обработку ошибок
4. Использовать `LoadingSpinner`

### Шаг 3: IncidentDetailPage
1. Обернуть в `Layout`
2. Добавить обработку ошибок для всех queries
3. Использовать `LoadingSpinner` и `ErrorMessage`

### Шаг 4: CreateIncidentPage
1. Обернуть в `Layout`
2. Использовать `Button` компонент
3. Добавить обработку ошибок

## 🚀 Дополнительные улучшения

### 1. Добавить обработку ошибок во все useQuery
```typescript
const { data, isLoading, error } = useQuery({...});

if (error) {
  return <ErrorMessage error={error} />;
}
```

### 2. Добавить debounce для поиска
См. пример выше в разделе "useDebounce hook"

### 3. Lazy loading страниц
```typescript
// В App.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          {/* ... */}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
```

### 4. Оптимизация React Query
```typescript
// В main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
    },
  },
});
```

### 5. Мемоизация компонентов
```typescript
import { memo } from 'react';

export const IncidentRow = memo(({ incident }: { incident: IncidentWithRelations }) => {
  // ...
});
```

## 📝 Чеклист миграции

- [ ] Обновить все страницы для использования `Layout`
- [ ] Заменить все кнопки на компонент `Button`
- [ ] Добавить `LoadingSpinner` вместо "Loading..."
- [ ] Добавить обработку ошибок во все `useQuery`
- [ ] Добавить `ErrorBoundary` в `main.tsx`
- [ ] Добавить `useDebounce` для поиска в `IncidentsPage`
- [ ] Добавить lazy loading для страниц
- [ ] Оптимизировать настройки React Query
- [ ] Добавить мемоизацию для компонентов списков

## ⚠️ Важные замечания

1. **Не ломайте существующий функционал** - мигрируйте постепенно
2. **Тестируйте после каждого изменения**
3. **Используйте git branches** для каждого улучшения
4. **Добавьте тесты** для новых компонентов

## 🎨 Следующие шаги (опционально)

1. Перейти на CSS модули или styled-components
2. Добавить react-hook-form для валидации форм
3. Добавить toast notifications
4. Добавить виртуализацию для длинных списков
5. Добавить unit и integration тесты
