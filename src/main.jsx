import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Error rendering app:', error)
  rootElement.innerHTML = `
    <div style="color: #00FF66; font-family: monospace; padding: 20px; background: #020403;">
      ERRO AO CARREGAR TERMINAL<br>
      ${error.message}
    </div>
  `
}
