import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import './Investigation.css'

function Investigation({ crime, state, onDiscoverClue, onMakeAccusation, onViewCase, onBack, onViewResult }) {
  const typewriterSoundRef = useRef(null)
  const [showAccusation, setShowAccusation] = useState(false)
  const [selectedSuspect, setSelectedSuspect] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showWitnesses, setShowWitnesses] = useState(false)
  const [witnessesViewed, setWitnessesViewed] = useState([])
  const [showSuspects, setShowSuspects] = useState(false)
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0)
  const [selectedClueIndex, setSelectedClueIndex] = useState(0)
  const [selectedWitnessIndex, setSelectedWitnessIndex] = useState(0)
  const [selectedSuspectIndex, setSelectedSuspectIndex] = useState(0)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0)
  const [currentSection, setCurrentSection] = useState('main') // main, clues, witnesses, suspects, accusation

  // Title animation state (typewriter like Home screen)
  const [titleLine1, setTitleLine1] = useState('')
  const [titleLine2, setTitleLine2] = useState('')
  const [titleLine3, setTitleLine3] = useState('')
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false)
  const [dateGlitched, setDateGlitched] = useState(false)
  const [dateGlitchAnim, setDateGlitchAnim] = useState(false)

  // Title animation - typewriter effect like Home screen
  useEffect(() => {
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    const caseNum = String(crime.id).slice(-3)
    const line1 = `Caso #${caseNum}`
    const line2 = `${crime.type} EM ${crime.location}`
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const line3Current = `${day}/${month}/${year}`
    const line3Glitched = `${day}/${month}/1987`

    setTitleLine1('')
    setTitleLine2('')
    setTitleLine3('')
    setTitleAnimationComplete(false)
    setDateGlitched(false)
    setDateGlitchAnim(false)

    let phase = 0
    let charIndex = 0
    let timeoutId = null

    const typeNext = () => {
      if (phase === 0) {
        // Line 1: Caso #XXX
        if (charIndex < line1.length) {
          if (line1[charIndex] !== ' ') typewriterSoundRef.current?.play()
          setTitleLine1(line1.slice(0, charIndex + 1))
          charIndex++
          timeoutId = setTimeout(typeNext, 30)
        } else {
          phase = 1
          charIndex = 0
          timeoutId = setTimeout(typeNext, 400)
        }
      } else if (phase === 1) {
        // Line 2: FURTO EM VIDEOLOCADORA
        if (charIndex < line2.length) {
          if (line2[charIndex] !== ' ') typewriterSoundRef.current?.play()
          setTitleLine2(line2.slice(0, charIndex + 1))
          charIndex++
          timeoutId = setTimeout(typeNext, 30)
        } else {
          phase = 2
          charIndex = 0
          timeoutId = setTimeout(typeNext, 400)
        }
      } else if (phase === 2) {
        // Line 3: date (current)
        if (charIndex < line3Current.length) {
          if (line3Current[charIndex] !== '/') typewriterSoundRef.current?.play()
          setTitleLine3(line3Current.slice(0, charIndex + 1))
          charIndex++
          timeoutId = setTimeout(typeNext, 30)
        } else {
          // Wait 1 second, then glitch to 1987
          timeoutId = setTimeout(() => {
            setDateGlitchAnim(true)
            setTimeout(() => {
              setTitleLine3(line3Glitched)
              setDateGlitched(true)
              setDateGlitchAnim(false)
              setTitleAnimationComplete(true)
            }, 150)
          }, 1000)
        }
      }
    }

    timeoutId = setTimeout(() => typeNext(), 500)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [crime.id, crime.type, crime.location])

  // Get available clues that haven't been revealed yet
  const availableClues = crime.clues.filter(clue => !clue.revealed)
  const revealedClues = crime.clues.filter(clue => clue.revealed)
  const canDiscoverMore = availableClues.length > 0
  const maxAttempts = 10
  const currentAttempts = Math.max(0, Math.min(state.attempts || 0, maxAttempts)) // Ensure valid range
  const remainingAttempts = Math.max(0, maxAttempts - currentAttempts)
  const isFailed = remainingAttempts <= 0 && !state.solved

  // Get suspects with records
  const suspectsWithRecords = crime.suspectsWithRecords || crime.suspects.map(s => 
    typeof s === 'object' ? s : { name: s, criminalRecord: 'Sem antecedentes' }
  )

  const handleDiscoverClue = (clueType) => {
    const clue = crime.clues.find(c => c.type === clueType && !c.revealed)
    if (clue) {
      clue.revealed = true
      onDiscoverClue()
    }
  }

  const handleViewWitness = (witnessIndex) => {
    if (!witnessesViewed.includes(witnessIndex)) {
      setWitnessesViewed([...witnessesViewed, witnessIndex])
    }
  }

  const getFeedbackMessage = (suspect, location, method) => {
    const correctSuspect = suspect === crime.solution.suspect
    const correctLocation = location === crime.solution.location
    const correctMethod = method === crime.solution.method

    const correctCount = [correctSuspect, correctLocation, correctMethod].filter(Boolean).length

    if (correctCount === 3) {
      return 'ACUSACAO CORRETA!'
    } else if (correctCount === 2) {
      if (!correctSuspect) return 'VOCE ESTA PERTO. REVISE O SUSPEITO.'
      if (!correctLocation) return 'VOCE ESTA PERTO. REVISE O LOCAL.'
      if (!correctMethod) return 'VOCE ESTA PERTO. REVISE O METODO.'
    } else if (correctCount === 1) {
      return 'ALGUMAS PARTES ESTAO CORRETAS. CONTINUE INVESTIGANDO.'
    } else {
      return 'ACUSACAO INCORRETA. REVISE TODAS AS OPCOES.'
    }
  }

  const handleAccusation = () => {
    if (!selectedSuspect || !selectedLocation || !selectedMethod) {
      setFeedback('SELECIONE TODAS AS OPCOES')
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    if (remainingAttempts <= 0) {
      setFeedback('TENTATIVAS ESGOTADAS. CASO ENCERRADO.')
      setTimeout(() => setFeedback(null), 3000)
      return
    }

    const isCorrect = onMakeAccusation(selectedSuspect, selectedLocation, selectedMethod)
    
    if (!isCorrect) {
      const feedbackMsg = getFeedbackMessage(selectedSuspect, selectedLocation, selectedMethod)
      setFeedback(feedbackMsg)
      setTimeout(() => setFeedback(null), 3000)
      
      if (remainingAttempts <= 1) {
        setTimeout(() => {
          setFeedback('CASO ENCERRADO. VOCE FALHOU.')
        }, 3000)
      }
    }
  }

  const renderProgressBar = (current, total) => {
    const safeCurrent = Math.max(0, Math.min(current || 0, total || 0))
    const safeTotal = Math.max(0, total || 0)
    const safeRemaining = Math.max(0, safeTotal - safeCurrent)
    const filled = '█'.repeat(safeCurrent)
    const empty = '░'.repeat(safeRemaining)
    return `[${filled}${empty}]`
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showAccusation) {
        // Navigation within accusation form
        if (e.key === 'Enter') {
          e.preventDefault()
          if (selectedSuspect && selectedLocation && selectedMethod && remainingAttempts > 0) {
            handleAccusation()
          }
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setShowAccusation(false)
        }
      } else {
        // Main navigation - simple up/down for main buttons
        const mainButtons = []
        if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
        if (!showSuspects) mainButtons.push('suspects')
        mainButtons.push('case')
        if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
        mainButtons.push('back')

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedButtonIndex(prev => Math.min(prev + 1, mainButtons.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedButtonIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const action = mainButtons[selectedButtonIndex]
          if (action === 'case') {
            onViewCase()
          } else if (action === 'accusation' && remainingAttempts > 0) {
            setShowAccusation(true)
          } else if (action === 'witnesses') {
            setShowWitnesses(true)
          } else if (action === 'suspects') {
            setShowSuspects(true)
          } else if (action === 'back') {
            onBack()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [showAccusation, selectedSuspect, selectedLocation, selectedMethod, canDiscoverMore, showWitnesses, showSuspects, isFailed, remainingAttempts, witnessesViewed.length, crime.witnesses.length, selectedButtonIndex, handleAccusation, onViewCase, onBack])

  return (
    <div className="investigation">
      <div className="terminal-header">
        <div className="separator">====================================</div>
        <div className="case-title-animated" style={{
          fontFamily: "'PxPlus IBM VGA8', monospace",
          fontSize: '18px',
          padding: '8px 0',
          color: '#00FF66',
          lineHeight: 1.6
        }}>
          <div>
            {titleLine1}
            {!titleAnimationComplete && titleLine2 === '' && titleLine1 && <span className="cursor-blink" style={{ animation: 'blink 1s step-end infinite' }}>█</span>}
          </div>
          <div>
            {titleLine2}
            {!titleAnimationComplete && titleLine2 && titleLine3 === '' && <span className="cursor-blink" style={{ animation: 'blink 1s step-end infinite' }}>█</span>}
          </div>
          <div className={dateGlitchAnim ? 'date-glitch' : ''}>
            {titleLine3}
            {!titleAnimationComplete && titleLine3 && !dateGlitchAnim && <span className="cursor-blink" style={{ animation: 'blink 1s step-end infinite' }}>█</span>}
          </div>
        </div>
        <div className="separator">====================================</div>
      </div>

      <div className="terminal-content">
        {/* Attempts counter */}
        <div className="section-title">
          TENTATIVAS: {currentAttempts}/{maxAttempts} {remainingAttempts > 0 ? `(${remainingAttempts} RESTANTES)` : '(ESGOTADAS)'}
        </div>

        {isFailed && (
          <>
            <div className="feedback error">
              CASO ENCERRADO. VOCE FALHOU.
            </div>
            <div style={{ marginTop: '16px' }}>
              <button 
                className="terminal-button highlight"
                onClick={onViewResult}
              >
                &gt; VER RESULTADO E COMPARTILHAR
              </button>
            </div>
          </>
        )}

        {/* Clues Section */}
        <div className="clues-section">
          <div className="section-title">
            PISTAS DISPONIVEIS: {revealedClues.length}/{crime.clues.length}
          </div>
          <div className="progress-bar">
            {renderProgressBar(revealedClues.length, crime.clues.length)}
          </div>

          <div className="separator">------------------------------------</div>

          {canDiscoverMore && !isFailed && (
            <div className="clue-selection">
              <div className="form-label">ESCOLHA QUAL PISTA REVELAR:</div>
              <div className="form-options">
                {availableClues.map((clue, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => handleDiscoverClue(clue.type)}
                  >
                    &gt; {clue.type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {revealedClues.length > 0 && (
            <div className="clues-list">
              <div className="section-title">PISTAS REVELADAS:</div>
              {revealedClues.map((clue, index) => (
                <div key={index} className="clue-item">
                  <span className="clue-text">{clue.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="separator">------------------------------------</div>

        {/* Witnesses Section */}
        <div className="witnesses-section">
          <div className="section-title">
            TESTEMUNHAS: {witnessesViewed.length}/{crime.witnesses.length}
          </div>
          <div className="progress-bar">
            {renderProgressBar(witnessesViewed.length, crime.witnesses.length)}
          </div>

          {!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed && (
            <button 
              className="terminal-button" 
              onClick={() => setShowWitnesses(true)}
            >
              &gt; VER TESTEMUNHAS
              {(() => {
                const mainButtons = []
                if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
                if (!showSuspects) mainButtons.push('suspects')
                if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
                return mainButtons.indexOf('witnesses') === selectedButtonIndex
              })() && (
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              )}
            </button>
          )}

          {showWitnesses && (
            <div className="witnesses-list">
              {crime.witnesses.map((witness, index) => (
                <div key={index} className="witness-item">
                  <div className="witness-header">
                    <span className="witness-name">{witness.name}</span>
                    {witnessesViewed.includes(index) && (
                      <span className={`witness-status ${witness.isTruthful ? 'truthful' : 'false'}`}>
                        {witness.isTruthful ? '[VERDADEIRA]' : '[PODE SER FALSA]'}
                      </span>
                    )}
                  </div>
                  {witnessesViewed.includes(index) ? (
                    <div className="witness-statement">{witness.statement}</div>
                  ) : (
                    <button
                      className="option-button"
                      onClick={() => handleViewWitness(index)}
                    >
                      &gt; VER DEPOIMENTO
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="separator">------------------------------------</div>

        {/* Suspects Database */}
        <div className="suspects-section">
          {!showSuspects ? (
            <button 
              className="terminal-button" 
              onClick={() => setShowSuspects(true)}
            >
              &gt; BANCO DE DADOS DOS SUSPEITOS
              {(() => {
                const mainButtons = []
                if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
                if (!showSuspects) mainButtons.push('suspects')
                mainButtons.push('case')
                if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
                return mainButtons.indexOf('suspects') === selectedButtonIndex
              })() && (
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              )}
            </button>
          ) : (
            <div className="suspects-database">
              <div className="section-title">BANCO DE DADOS DOS SUSPEITOS:</div>
              {suspectsWithRecords.map((suspect, index) => (
                <div key={index} className="suspect-record">
                  <div className="suspect-name">{suspect.name}</div>
                  <div className="suspect-record-text">
                    HISTORICO: {suspect.criminalRecord}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="separator">------------------------------------</div>

        {/* Case Description Section */}
        <div className="case-section">
          <button 
            className="terminal-button" 
            onClick={onViewCase}
          >
            &gt; CASO
            {(() => {
              const mainButtons = []
              if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
              if (!showSuspects) mainButtons.push('suspects')
              mainButtons.push('case')
              if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
              return mainButtons.indexOf('case') === selectedButtonIndex
            })() && (
              <span className="cursor-blink" style={{
                color: '#00FF66',
                animation: 'blink 1s step-end infinite',
                marginLeft: '4px'
              }}>█</span>
            )}
          </button>
        </div>

        <div className="separator">------------------------------------</div>

        {/* Hypothesis Section */}
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

        {/* Accusation Form */}
        {!showAccusation && !isFailed ? (
          <button 
            className="terminal-button"
            onClick={() => remainingAttempts > 0 && setShowAccusation(true)}
            style={{
              opacity: remainingAttempts <= 0 ? 0.5 : 1,
              cursor: remainingAttempts <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            &gt; FAZER ACUSACAO ({remainingAttempts > 0 ? `${remainingAttempts} TENTATIVA${remainingAttempts !== 1 ? 'S' : ''} RESTANTE${remainingAttempts !== 1 ? 'S' : ''}` : 'ESGOTADAS'})
            {(() => {
              const mainButtons = []
              if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
              if (!showSuspects) mainButtons.push('suspects')
              if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
              return mainButtons.indexOf('accusation') === selectedButtonIndex
            })() && (
              <span className="cursor-blink" style={{
                color: '#00FF66',
                animation: 'blink 1s step-end infinite',
                marginLeft: '4px'
              }}>█</span>
            )}
          </button>
        ) : showAccusation && !isFailed ? (
          <div className="accusation-form">
            <div className="form-group">
              <div className="form-label">SUSPEITO:</div>
              <div className="form-options">
                {suspectsWithRecords.map((suspect) => (
                  <button
                    key={suspect.name}
                    className={`option-button ${selectedSuspect === suspect.name ? 'selected' : ''}`}
                    onClick={() => setSelectedSuspect(suspect.name)}
                  >
                    &gt; {suspect.name}
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
              <div className={`feedback ${feedback.includes('CORRETA') ? 'success' : feedback.includes('PERTO') ? 'warning' : 'error'}`}>
                {feedback}
              </div>
            )}

            <button 
              className="terminal-button highlight"
              onClick={handleAccusation}
              style={{
                opacity: remainingAttempts <= 0 ? 0.5 : 1,
                cursor: remainingAttempts <= 0 ? 'not-allowed' : 'pointer'
              }}
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
        ) : null}

        <div className="separator">------------------------------------</div>

        <button 
          className="terminal-button secondary"
          onClick={onBack}
        >
          &gt; VOLTAR AO INICIO
          {(() => {
            const mainButtons = []
            if (!showWitnesses && witnessesViewed.length < crime.witnesses.length && !isFailed) mainButtons.push('witnesses')
            if (!showSuspects) mainButtons.push('suspects')
            mainButtons.push('case')
            if (!isFailed && remainingAttempts > 0) mainButtons.push('accusation')
            mainButtons.push('back')
            return mainButtons.length - 1 === selectedButtonIndex
          })() && (
            <span className="cursor-blink" style={{
              color: '#00FF66',
              animation: 'blink 1s step-end infinite',
              marginLeft: '4px'
            }}>█</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default Investigation
