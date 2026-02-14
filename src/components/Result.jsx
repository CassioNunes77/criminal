import { useState } from 'react'
import './Result.css'

function Result({ crime, state, onBack, onBackToInvestigation, onViewDossier }) {
  const [showShare, setShowShare] = useState(false)
  const [showCodeCopied, setShowCodeCopied] = useState(false)

  const caseCode = crime.caseCode || String(crime.id)

  // Usar stats congeladas quando caso já resolvido (não altera se jogador explorar mais)
  const displayStats = state.solved && state.solvedStats
    ? state.solvedStats
    : { attempts: state.attempts, cluesDiscovered: state.cluesDiscovered, witnessesViewed: state.witnessesViewed || [] }

  const cluesRevealed = displayStats.cluesDiscovered || (crime.clues ? crime.clues.filter(c => c.revealed).length : 0)
  const witnessesViewed = displayStats.witnessesViewed || []
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

  // Precisão: 100% base. Maior peso para tentativas (55%), depois pistas (25%), testemunhas (20%)
  // 1ª tentativa correta + 0 pistas + 0 testemunhas = 100%
  // 3 tentativas sem resolver = 0%
  const totalClues = crime.clues ? crime.clues.length : 6
  const totalWitnesses = 3
  const maxAttempts = 3
  const isFailed = !state.solved && (displayStats.attempts || 0) >= maxAttempts
  const accuracy = isFailed
    ? 0
    : Math.max(0, Math.min(100, Math.round(
        100 -
        cluesRevealed * (25 / totalClues) -
        witnessesCount * (20 / totalWitnesses) -
        Math.max(0, displayStats.attempts - 1) * (55 / (maxAttempts - 1))
      )))

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

  const shareCluesBar = '[' + '■'.repeat(Math.min(cluesRevealed || 0, totalClues)) + '□'.repeat(Math.max(0, totalClues - (cluesRevealed || 0))) + ']'
  const shareWitnessesBar = '[' + '■'.repeat(Math.min(witnessesCount || 0, totalWitnesses)) + '□'.repeat(Math.max(0, totalWitnesses - (witnessesCount || 0))) + ']'
  const shareAttemptsBar = '[' + '■'.repeat(Math.min(displayStats.attempts || 0, maxAttempts)) + '□'.repeat(Math.max(0, maxAttempts - (displayStats.attempts || 0))) + ']'
  
  const statusShare = state.solved ? 'RESOLVIDO' : 'ENCERRADO'
  const shareText = `CASO #${crime.caseNumber || String(crime.id).slice(-3)} - ${statusShare}

${accuracy}% DE PRECISÃO.
PISTAS: ${shareCluesBar}
TESTEMUNHAS: ${shareWitnessesBar}
TENTATIVAS: ${shareAttemptsBar}

https://nexoterminal.netlify.app/`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
    setShowShare(true)
    setTimeout(() => setShowShare(false), 2000)
  }

  const copyCaseCode = () => {
    navigator.clipboard.writeText(caseCode)
    setShowCodeCopied(true)
    setTimeout(() => setShowCodeCopied(false), 2000)
  }

  return (
    <div className="result">
      <div className="terminal-header">
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
        <div className={`title ${state.solved ? 'flash-green' : 'error'}`}>
          {state.solved ? 'CASO RESOLVIDO' : 'CASO ENCERRADO'}
        </div>
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
      </div>

      <div className="terminal-content">
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

        <div className="stats-section">
          <div className="stat-item">
            TENTATIVAS: {displayStats.attempts}
          </div>
          <div className="stat-item">
            PISTAS USADAS: {displayStats.cluesDiscovered}
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

        {state.solved && (3 - displayStats.attempts) > 0 && onBackToInvestigation && (
          <>
            <button 
              className="terminal-button secondary"
              onClick={onBackToInvestigation}
            >
              &gt; CONTINUAR INVESTIGANDO
            </button>
            <div className="separator">------------------------------------</div>
          </>
        )}

        {!state.solved && onBackToInvestigation && crime.clues && (crime.clues.length - (state.cluesRevealed?.length || 0)) > 0 && (
          <>
            <button 
              className="terminal-button secondary"
              onClick={onBackToInvestigation}
            >
              &gt; VER PISTAS NAO REVELADAS
            </button>
            <div className="separator">------------------------------------</div>
          </>
        )}

        {crime.dossier && onViewDossier && (
          <>
            <button 
              className="terminal-button secondary"
              onClick={onViewDossier}
            >
              &gt; VER DOSSIER DO CASO
            </button>
            <div className="separator">------------------------------------</div>
          </>
        )}

        <button 
          className="terminal-button"
          onClick={onBack}
        >
          &gt; VOLTAR AO INICIO
        </button>

        <div className="case-code-section">
          <div className="case-code-line">
            CODIGO: <span 
              className="highlight case-code-clickable" 
              onClick={copyCaseCode}
              title="Clique para copiar"
            >
              {caseCode}
            </span>
            {showCodeCopied && (
              <span className="case-code-feedback">&gt; Codigo Copiado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Result
