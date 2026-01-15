interface ErrorMessageProps {
  error: Error | unknown;
  title?: string;
}

export function ErrorMessage({ error, title = 'An error occurred' }: ErrorMessageProps) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'Something went wrong';

  return (
    <div
      style={{
        padding: '0.75rem',
        marginBottom: '1rem',
        backgroundColor: '#fee',
        color: '#c33',
        borderRadius: '4px',
      }}
    >
      <strong>{title}:</strong> {message}
    </div>
  );
}
