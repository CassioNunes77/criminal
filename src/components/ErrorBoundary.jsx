import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: '#00FF66',
          fontFamily: 'IBM Plex Mono, monospace',
          padding: '20px',
          background: '#020403',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            ERRO NO TERMINAL
          </div>
          <div style={{ fontSize: '14px', color: '#00CC55' }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
