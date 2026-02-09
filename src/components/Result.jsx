import { useState, useEffect } from 'react'
import './Result.css'

function Result({ crime, state, onBack }) {
  const [showShare, setShowShare] = useState(false)

  const cluesRevealed = state.cluesDiscovered || (crime.clues ? crime.clues.filter(c => c.revealed).length : 0)
  const witnessesViewed = state.witnessesViewed || []
  const witnessesCount = witnessesViewed.length || (crime.witnesses ? crime.witnesses.length : 0)
  
  const renderCluesBar = () => {
    const total = crime.clues ? crime.clues.length : 6
    const filled = '█'.repeat(cluesRevealed)
    const empty = '░'.repeat(total - cluesRevealed)
    return `[${filled}${empty}]`
  }
  
  const renderWitnessesBar = () => {
    const total = 3
    const filled = '█'.repeat(witnessesCount)
    const empty = '░'.repeat(total - witnessesCount)
    return `[${filled}${empty}]`
  }
  
  const cluesBar = renderCluesBar()
  const witnessesBar = renderWitnessesBar()
  
  const accuracy = crime.clues ? Math.round((cluesRevealed / crime.clues.length) * 100) : 0

  const renderAccuracyBar = () => {
    const filled = Math.round(accuracy / 10)
    const filledBars = '■'.repeat(filled)
    const emptyBars = '□'.repeat(10 - filled)
    return `[${filledBars}${emptyBars}]`
  }
  
  const attemptText = state.attempts === 1 ? '1ª tentativa' : 
                      state.attempts === 2 ? '2ª tentativa' : 
                      state.attempts === 3 ? '3ª tentativa' : 
                      `${state.attempts}ª tentativa`

  const shareText = `CASO #${String(crime.id).slice(-3)}

PISTAS: ${cluesBar}
TESTEMUNHAS: ${witnessesBar}
ACUSACAO: ${attemptText}

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
        <div className={`title ${state.solved ? 'flash-green' : 'error'}`}>
          {state.solved ? 'CASO RESOLVIDO' : 'CASO ENCERRADO'}
        </div>
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
