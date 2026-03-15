import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Bloquear zoom (Ctrl+scroll, pinch) em todas as telas
document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault() }, { passive: false })
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Error rendering app:', error)
  rootElement.innerHTML = `
    <div style="color: #00CC55; font-family: 'PxPlus IBM VGA8', monospace; padding: 20px; background: #000; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      ERRO AO CARREGAR TERMINAL<br>
      ${error.message}
    </div>
  `
}
