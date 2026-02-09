import { useState } from 'react'
import './Investigation.css'

function Investigation({ crime, state, onDiscoverClue, onMakeAccusation, onBack }) {
  const [showAccusation, setShowAccusation] = useState(false)
  const [selectedSuspect, setSelectedSuspect] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const availableClues = crime.clues.slice(0, state.cluesDiscovered)
  const canDiscoverMore = state.cluesDiscovered < crime.clues.length

  const handleAccusation = () => {
    if (!selectedSuspect || !selectedLocation || !selectedMethod) {
      setFeedback('SELECIONE TODAS AS OPCOES')
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    const isCorrect = onMakeAccusation(selectedSuspect, selectedLocation, selectedMethod)
    
    if (!isCorrect) {
      setFeedback('ACUSACAO INCORRETA')
      setTimeout(() => setFeedback(null), 2000)
    }
  }

  const renderProgressBar = () => {
    const total = crime.clues.length
    const discovered = state.cluesDiscovered
    const filled = '█'.repeat(discovered)
    const empty = '░'.repeat(total - discovered)
    return `[${filled}${empty}]`
  }

  return (
    <div className="investigation">
      <div className="terminal-header">
        <div className="separator">====================================</div>
        <div className="title">CASO #{String(crime.id).slice(-3)}</div>
        <div className="separator">====================================</div>
      </div>

      <div className="terminal-content">
        <div className="clues-section">
          <div className="section-title">
            PISTAS DESCOBERTAS: {state.cluesDiscovered}/{crime.clues.length}
          </div>
          <div className="progress-bar">
            {renderProgressBar()}
          </div>

          <div className="separator">------------------------------------</div>

          {canDiscoverMore && (
            <button 
              className="terminal-button" 
              onClick={onDiscoverClue}
            >
              &gt; ANALISAR NOVA PISTA
            </button>
          )}

          <div className="clues-list">
            {availableClues.map((clue, index) => (
              <div key={index} className="clue-item">
                <span className="clue-text">{clue.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        <div className="hypothesis-section">
          <div className="section-title">HIPOTESE ATUAL:</div>
          <div className="hypothesis-line">
            SUSPEITO: {selectedSuspect || '?'}
          </div>
          <div className="hypothesis-line">
            LOCAL: {selectedLocation || '?'}
          </div>
          <div className="hypothesis-line">
            METODO: {selectedMethod || '?'}
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        {!showAccusation ? (
          <button 
            className="terminal-button"
            onClick={() => setShowAccusation(true)}
          >
            &gt; FAZER ACUSACAO
          </button>
        ) : (
          <div className="accusation-form">
            <div className="form-group">
              <div className="form-label">SUSPEITO:</div>
              <div className="form-options">
                {crime.suspects.map((suspect) => (
                  <button
                    key={suspect}
                    className={`option-button ${selectedSuspect === suspect ? 'selected' : ''}`}
                    onClick={() => setSelectedSuspect(suspect)}
                  >
                    &gt; {suspect}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">LOCAL:</div>
              <div className="form-options">
                {crime.locations.map((location) => (
                  <button
                    key={location}
                    className={`option-button ${selectedLocation === location ? 'selected' : ''}`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    &gt; {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">METODO:</div>
              <div className="form-options">
                {crime.methods.map((method) => (
                  <button
                    key={method}
                    className={`option-button ${selectedMethod === method ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod(method)}
                  >
                    &gt; {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="separator">------------------------------------</div>

            {feedback && (
              <div className={`feedback ${feedback.includes('INCORRETA') ? 'error' : ''}`}>
                {feedback}
              </div>
            )}

            <button 
              className="terminal-button highlight"
              onClick={handleAccusation}
            >
              &gt; CONFIRMAR ACUSACAO
            </button>

            <button 
              className="terminal-button secondary"
              onClick={() => setShowAccusation(false)}
            >
              &gt; CANCELAR
            </button>
          </div>
        )}

        <div className="separator">------------------------------------</div>

        <button 
          className="terminal-button secondary"
          onClick={onBack}
        >
          &gt; VOLTAR AO INICIO
        </button>
      </div>
    </div>
  )
}

export default Investigation
