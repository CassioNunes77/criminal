import { useState, useEffect } from 'react'
import './Result.css'

function Result({ crime, state, onBack }) {
  const [showShare, setShowShare] = useState(false)

  const cluesRevealed = state.cluesDiscovered || (crime.clues ? crime.clues.filter(c => c.revealed).length : 0)
  const witnessesViewed = state.witnessesViewed || []
  const witnessesCount = witnessesViewed.length || (crime.witnesses ? crime.witnesses.length : 0)
  
  const renderCluesBar = () => {
    const total = crime.clues ? crime.clues.length : 6
    const safeRevealed = Math.max(0, Math.min(cluesRevealed || 0, total))
    const safeRemaining = Math.max(0, total - safeRevealed)
    const filled = '■'.repeat(safeRevealed)
    const empty = '□'.repeat(safeRemaining)
    return `[${filled}${empty}]`
  }
  
  const renderWitnessesBar = () => {
    const total = 3
    const safeCount = Math.max(0, Math.min(witnessesCount || 0, total))
    const safeRemaining = Math.max(0, total - safeCount)
    const filled = '■'.repeat(safeCount)
    const empty = '□'.repeat(safeRemaining)
    return `[${filled}${empty}]`
  }
  
  const cluesBar = renderCluesBar()
  const witnessesBar = renderWitnessesBar()

  // Precisão: começa em 100% e diminui conforme pistas, testemunhas e tentativas usadas
  // Cada pista: -5% (máx 6 = -30%) | Cada testemunha: -10% (máx 3 = -30%) | Cada tentativa: -4% (máx 10 = -40%)
  const totalClues = crime.clues ? crime.clues.length : 6
  const totalWitnesses = 3
  const maxAttempts = 10
  const penaltyClues = cluesRevealed * (30 / totalClues)
  const penaltyWitnesses = witnessesCount * (30 / totalWitnesses)
  const penaltyAttempts = state.attempts * (40 / maxAttempts)
  const accuracy = Math.max(0, Math.min(100, Math.round(100 - penaltyClues - penaltyWitnesses - penaltyAttempts)))

  const renderAccuracyBar = () => {
    const safeFilled = Math.max(0, Math.min(Math.round(accuracy / 10), 10))
    const safeEmpty = Math.max(0, 10 - safeFilled)
    const filledBars = '■'.repeat(safeFilled)
    const emptyBars = '□'.repeat(safeEmpty)
    return `[${filledBars}${emptyBars}]`
  }
  
  const attemptText = state.attempts === 1 ? '1º Tentativa' : 
                      state.attempts === 2 ? '2º Tentativa' : 
                      state.attempts === 3 ? '3º Tentativa' : 
                      `${state.attempts}º Tentativa`

  const statusText = state.solved ? 'RESOLVIDO' : 'ENCERRADO'
  
  const shareText = `CASO #${String(crime.id).slice(-3)} - ${statusText}

PISTAS: ${cluesBar}
TESTEMUNHAS: ${witnessesBar}
ACUSAÇÃO: ${attemptText}

http://nexoterminal.netlify.app`

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
            TESTEMUNHAS: {witnessesCount}
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
          <button 
            className="terminal-button highlight"
            onClick={copyToClipboard}
            style={{ marginTop: '12px' }}
          >
            &gt; COMPARTILHAR RESULTADO
          </button>
          {showShare && (
            <div className="share-feedback">
              COPIADO PARA AREA DE TRANSFERENCIA!
            </div>
          )}
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
