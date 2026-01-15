import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { queryKeys, IncidentWithRelations, CommentWithAuthor, UpdateIncidentRequest, IncidentStatus, AuditLogWithActor } from '@incident-tracker/shared';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: incident, isLoading } = useQuery<IncidentWithRelations>({
    queryKey: queryKeys.incidents.detail(id!),
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: comments } = useQuery<CommentWithAuthor[]>({
    queryKey: queryKeys.incidents.comments(id!),
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}/comments`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: auditLogs } = useQuery<AuditLogWithActor[]>({
    queryKey: queryKeys.incidents.audit(id!),
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}/audit`);
      return response.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateIncidentRequest) => api.patch(`/incidents/${id}`, data),
    onSuccess: () => {
      // Invalidate all related queries after status update
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() }); // Invalidate all incident lists
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() }); // Invalidate dashboard summary
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.audit(id!) }); // Invalidate audit logs
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => api.post(`/incidents/${id}/comments`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.comments(id!) });
      setCommentText('');
    },
  });

  const handleStatusChange = (status: IncidentStatus) => {
    updateMutation.mutate({ status });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!incident) {
    return <div>Incident not found</div>;
  }

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
        <Link to="/incidents" style={{ textDecoration: 'none', color: '#007bff', marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Incidents
        </Link>

        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2>{incident.title}</h2>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              {Object.values(IncidentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Severity:</strong> {incident.severity}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Reporter:</strong> {incident.reporter.name}
          </div>
          {incident.assignee && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Assignee:</strong> {incident.assignee.name}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <strong>Description:</strong>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{incident.description}</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Comments</h3>
          <form onSubmit={handleAddComment} style={{ marginBottom: '1rem' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '100px',
                marginBottom: '0.5rem',
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentMutation.isPending}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Add Comment
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments?.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{comment.author.name}</strong>
                  <span style={{ color: '#666', fontSize: '0.875rem' }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{comment.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Audit Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {auditLogs?.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <strong>{log.actor.name}</strong> {log.action} on{' '}
                {new Date(log.createdAt).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
