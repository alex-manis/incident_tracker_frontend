import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { queryKeys, DashboardSummary } from '@incident-tracker/shared';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data;
    },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header
        style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h1>Incident Tracker</h1>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff' }}>
              Dashboard
            </Link>
            <Link to="/incidents" style={{ textDecoration: 'none', color: '#007bff' }}>
              Incidents
            </Link>
            <span style={{ color: '#666' }}>{user?.name}</span>
            <button
              onClick={() => logout()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>

        {isLoading ? (
          <div>Loading...</div>
        ) : summary ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Incidents
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.totalIncidents}</p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Open
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.openIncidents}</p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                In Progress
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {summary.inProgressIncidents}
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Resolved
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{summary.resolvedIncidents}</p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Critical
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                {summary.criticalIncidents}
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
