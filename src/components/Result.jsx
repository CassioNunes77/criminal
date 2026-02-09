import { useState, useEffect } from 'react'
import './Result.css'

function Result({ crime, state, onBack }) {
  const [showShare, setShowShare] = useState(false)

  const accuracy = Math.round(
    (state.cluesDiscovered / crime.clues.length) * 100
  )

  const renderAccuracyBar = () => {
    const filled = Math.round(accuracy / 10)
    const filledBars = '■'.repeat(filled)
    const emptyBars = '□'.repeat(10 - filled)
    return `[${filledBars}${emptyBars}]`
  }

  const shareText = `CASO #${String(crime.id).slice(-3)} - RESOLVIDO

PISTAS: ${renderAccuracyBar()}
TENTATIVAS: ${state.attempts}
SEQUENCIA: ${state.streak} ${state.streak === 1 ? 'DIA' : 'DIAS'}

JOGUE EM:
https://selenecriminal.netlify.app/`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
    setShowShare(true)
    setTimeout(() => setShowShare(false), 2000)
  }

  return (
    <div className="result">
      <div className="terminal-header">
        <div className="separator">====================================</div>
        <div className="title flash-green">CASO RESOLVIDO</div>
        <div className="separator">====================================</div>
      </div>

      <div className="terminal-content">
        <div className="stats-section">
          <div className="stat-item">
            TENTATIVAS: {state.attempts}
          </div>
          <div className="stat-item">
            PISTAS USADAS: {state.cluesDiscovered}
          </div>
          <div className="stat-item">
            SEQUENCIA: {state.streak} {state.streak === 1 ? 'DIA' : 'DIAS'}
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        <div className="result-section">
          <div className="section-title">RESULTADO:</div>
          <div className="accuracy-bar">
            {renderAccuracyBar()}
          </div>
          <div className="accuracy-text">
            {accuracy}% DE PRECISAO
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        <div className="solution-section">
          <div className="section-title">SOLUCAO:</div>
          <div className="solution-item">
            SUSPEITO: <span className="highlight">{crime.solution.suspect}</span>
          </div>
          <div className="solution-item">
            LOCAL: <span className="highlight">{crime.solution.location}</span>
          </div>
          <div className="solution-item">
            METODO: <span className="highlight">{crime.solution.method}</span>
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        <button 
          className="terminal-button highlight"
          onClick={copyToClipboard}
        >
          &gt; COMPARTILHAR RESULTADO
        </button>

        {showShare && (
          <div className="share-feedback">
            COPIADO PARA AREA DE TRANSFERENCIA!
          </div>
        )}

        <div className="separator">------------------------------------</div>

        <button 
          className="terminal-button"
          onClick={onBack}
        >
          &gt; VOLTAR AO INICIO
        </button>
      </div>
    </div>
  )
}

export default Result
