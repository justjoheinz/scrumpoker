'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main>
      <div className="container">
        <div className="row">
          <div className="col s12 m8 offset-m2 l6 offset-l3" style={{ marginTop: '50px' }}>
            <div className="card red lighten-4">
              <div className="card-content">
                <span className="card-title red-text text-darken-4">
                  <i className="material-icons left">error</i>
                  Something went wrong
                </span>
                <p className="red-text text-darken-2">
                  An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <pre style={{
                    marginTop: '20px',
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '0.85rem'
                  }}>
                    {error.message}
                  </pre>
                )}
              </div>
              <div className="card-action">
                <button
                  className="btn waves-effect waves-light red"
                  onClick={reset}
                >
                  Try again
                  <i className="material-icons right">refresh</i>
                </button>
                <a href="/" className="btn waves-effect waves-light teal">
                  Go home
                  <i className="material-icons right">home</i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
