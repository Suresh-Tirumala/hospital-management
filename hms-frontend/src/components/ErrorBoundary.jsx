import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          backgroundColor: '#fff1f2',
          border: '2px solid #f43f5e',
          borderRadius: '12px',
          margin: '20px',
          color: '#9f1239',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          <h2 style={{ color: '#be123c', marginBottom: '16px' }}>🚨 Component Crash Detected</h2>
          <p style={{ fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
          <div style={{ 
            marginTop: '20px', 
            fontSize: '12px', 
            maxHeight: '400px', 
            overflow: 'auto',
            background: '#fff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #fda4af'
          }}>
            {this.state.errorInfo?.componentStack}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#f43f5e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
