# Incident Tracker Frontend

React application for the incident tracking system.

## Technologies

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Axios

## Installation

```bash
pnpm install
```

## Configuration

Configure API URL in `src/lib/api.ts` if backend runs on a different port/domain.

By default, proxy is used through Vite (see `vite.config.ts`).

## Running

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── main.tsx           # Entry point
├── App.tsx            # Main component
├── pages/             # Pages
├── components/        # Components
├── contexts/          # React contexts
└── lib/               # Utilities (API client)
```

## Routes

- `/login` - Login page
- `/dashboard` - Dashboard with statistics
- `/incidents` - Incidents list
- `/incidents/new` - Create incident
- `/incidents/:id` - Incident details

## Dependencies

The project uses a shared package `@incident-tracker/shared` for types and schemas. Make sure it's available in the workspace or installed separately.

## Environment Variables

Create a `.env` file if needed:

```env
VITE_API_URL=http://localhost:3001
```
