import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import {
  queryKeys,
  IncidentWithRelations,
  IncidentFilters,
  IncidentStatus,
  IncidentSeverity,
  PaginationParams,
} from '@incident-tracker/shared';

export default function IncidentsPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.incidents.list({ ...filters, page }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get(`/incidents?${params.toString()}`);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>Incidents</h2>
          <Link
            to="/incidents/new"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            New Incident
          </Link>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                flex: 1,
                minWidth: '200px',
              }}
            />
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: (e.target.value as IncidentStatus) || undefined })
              }
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">All Statuses</option>
              {Object.values(IncidentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={filters.severity || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  severity: (e.target.value as IncidentSeverity) || undefined,
                })
              }
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">All Severities</option>
              {Object.values(IncidentSeverity).map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : data?.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No incidents found
          </div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Title
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Severity
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Reporter
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((incident: IncidentWithRelations) => (
                    <tr
                      key={incident.id}
                      style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                      onClick={() => (window.location.href = `/incidents/${incident.id}`)}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <Link
                          to={`/incidents/${incident.id}`}
                          style={{ textDecoration: 'none', color: '#007bff' }}
                        >
                          {incident.title}
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{incident.severity}</td>
                      <td style={{ padding: '0.75rem' }}>{incident.status}</td>
                      <td style={{ padding: '0.75rem' }}>{incident.reporter.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.meta && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div>
                  Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.meta.totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: page >= data.meta.totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
