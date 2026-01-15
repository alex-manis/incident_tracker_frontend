import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { queryKeys, CreateIncidentRequest, IncidentSeverity } from '@incident-tracker/shared';
import { Footer } from '../components/layout/Footer';

export default function CreateIncidentPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateIncidentRequest>({
    title: '',
    description: '',
    severity: IncidentSeverity.MEDIUM,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateIncidentRequest) => api.post('/incidents', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      navigate(`/incidents/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
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
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#007bff', cursor: 'pointer' }}>
              Dashboard
            </Link>
            <Link to="/incidents" style={{ textDecoration: 'none', color: '#007bff', cursor: 'pointer' }}>
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

      <main style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 2rem', flex: 1 }}>
        <Link to="/incidents" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '1rem', display: 'inline-block', cursor: 'pointer' }}>
          ← Back to Incidents
        </Link>

        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginBottom: '1.5rem' }}>Create New Incident</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="title"
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="description"
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minHeight: '150px',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="severity"
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Severity *
              </label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as IncidentSeverity })
                }
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                {Object.values(IncidentSeverity).map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            {createMutation.isError && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: '4px',
                }}
              >
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to create incident'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={createMutation.isPending}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: createMutation.isPending ? 0.6 : 1,
                }}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Incident'}
              </button>
              <Link
                to="/incidents"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  display: 'inline-block',
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
