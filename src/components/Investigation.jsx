import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import CaseView from './CaseView'
import './Investigation.css'

function Investigation({ crime, state, onDiscoverClue, onViewWitness, onMakeAccusation, onBack, onViewResult, x7 }) {
  const typewriterSoundRef = useRef(null)
  const lastClueRevealTimeRef = useRef(0)
  const [showAccusation, setShowAccusation] = useState(false)
  const [selectedSuspect, setSelectedSuspect] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showWitnesses, setShowWitnesses] = useState(false)
  const [witnessNavActive, setWitnessNavActive] = useState(false)
  const witnessesViewed = state.witnessesViewed || []
  const [showSuspects, setShowSuspects] = useState(false)
  const [showCaseView, setShowCaseView] = useState(false)
  const [selectedFocusIndex, setSelectedFocusIndex] = useState(0)
  const [selectedClueIndex, setSelectedClueIndex] = useState(0)
  const [selectedWitnessIndex, setSelectedWitnessIndex] = useState(0)
  const [selectedSuspectIndex, setSelectedSuspectIndex] = useState(0)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0)
  const [accusationFocusIndex, setAccusationFocusIndex] = useState(0)

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

    const caseNum = crime.caseNumber || String(crime.id).slice(-3)
    const line1 = `Caso #${caseNum}`
    const line2 = crime.type || crime.title || ''
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
            typewriterSoundRef.current?.playGlitch?.()
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
  }, [crime.id, crime.type, crime.title])

  // Get available and revealed clues (usar state.cluesRevealed para re-render correto)
  const cluesRevealed = state.cluesRevealed || []
  const availableClues = crime.clues.filter(clue => !cluesRevealed.includes(clue.type))
  const revealedClues = crime.clues.filter(clue => cluesRevealed.includes(clue.type))
  const canDiscoverMore = availableClues.length > 0
  const maxAttempts = (x7 && window.innerWidth >= 768) ? 999 : 3
  const currentAttempts = Math.max(0, Math.min(state.attempts || 0, maxAttempts))
  const remainingAttempts = Math.max(0, maxAttempts - currentAttempts)
  const isFailed = remainingAttempts <= 0 && !state.solved
  const showViewResult = state.solved || isFailed

  // Get suspects with records
  const suspectsWithRecords = crime.suspectsWithRecords || crime.suspects.map(s =>
    typeof s === 'object' ? s : { name: s, criminalRecord: 'Sem antecedentes' }
  )

  // Main menu buttons - ordem única para cursor e teclado (testemunhas sempre visível, inclusive após caso resolvido)
  const mainButtons = [
    !showWitnesses && 'witnesses',
    !showSuspects && 'suspects',
    'case',
    'accusation',
    showViewResult && 'viewResult',
    'back'
  ].filter(Boolean)

  // Itens focáveis: pistas (se houver) + botões do menu. Ordem visual para setas cima/baixo
  const focusableItems = [
    ...(canDiscoverMore ? availableClues.map((c, i) => ({ type: 'clue', index: i })) : []),
    ...mainButtons.map(id => ({ type: 'button', id }))
  ]

  // Clamp selectedFocusIndex quando focusableItems muda
  useEffect(() => {
    const max = Math.max(0, focusableItems.length - 1)
    setSelectedFocusIndex(prev => (prev > max ? max : prev))
  }, [focusableItems.length])

  // Desktop: scroll sincronizado com o cursor ao navegar com setas (exceto ao revelar pistas)
  useEffect(() => {
    if (window.innerWidth < 769) return
    if (Date.now() - lastClueRevealTimeRef.current < 200) return // Não rolar ao revelar pista
    const focusedItem = focusableItems[selectedFocusIndex]
    if (focusedItem?.type === 'clue') return // Não rolar ao navegar entre pistas
    const el = document.querySelector('.investigation .terminal-content [data-focused="true"]')
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [selectedFocusIndex, accusationFocusIndex, selectedWitnessIndex, showWitnesses, showAccusation, focusableItems])

  // Reset accusationFocusIndex ao abrir formulário de acusação
  useEffect(() => {
    if (showAccusation) setAccusationFocusIndex(0)
  }, [showAccusation])

  // Reset e clamp selectedWitnessIndex para testemunhas
  useEffect(() => {
    if (showWitnesses) {
      const count = crime.witnesses.filter((_, i) => !witnessesViewed.includes(i)).length
      setSelectedWitnessIndex(prev => {
        if (count === 0) return 0
        return Math.min(prev, count - 1)
      })
    }
  }, [showWitnesses, witnessesViewed.length, crime.witnesses.length])

  const handleDiscoverClue = (clueType) => {
    if (cluesRevealed.includes(clueType)) return
    const clue = crime.clues.find(c => c.type === clueType)
    if (clue) {
      lastClueRevealTimeRef.current = Date.now()
      onDiscoverClue(clueType)
    }
  }

  const handleViewWitness = (witnessIndex) => {
    if (!witnessesViewed.includes(witnessIndex)) {
      onViewWitness(witnessIndex)
    }
  }

  const getFeedbackMessage = (suspect, location, method) => {
    const norm = (s) => (s ?? '').trim().replace(/\s+/g, ' ')
    const correctSuspect = norm(suspect) === norm(crime.solution.suspect)
    const correctLocation = norm(location) === norm(crime.solution.location)
    const correctMethod = norm(method) === norm(crime.solution.method)

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
        const accItems = [
          ...suspectsWithRecords.map(s => ({ type: 'suspect', value: typeof s === 'object' ? (s.name ?? s.displayName ?? '') : String(s) })),
          ...crime.locations.map(l => ({ type: 'location', value: typeof l === 'string' ? l : (l?.type ?? l?.name ?? l?.value ?? '') })),
          ...crime.methods.map(m => ({ type: 'method', value: typeof m === 'string' ? m : (m?.type ?? m?.name ?? m?.value ?? '') })),
          { type: 'confirm' },
          { type: 'cancel' }
        ]
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setAccusationFocusIndex(prev => Math.min(prev + 1, accItems.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setAccusationFocusIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const item = accItems[accusationFocusIndex]
          if (item.type === 'suspect') setSelectedSuspect(item.value)
          else if (item.type === 'location') setSelectedLocation(item.value)
          else if (item.type === 'method') setSelectedMethod(item.value)
          else if (item.type === 'confirm' && selectedSuspect && selectedLocation && selectedMethod && remainingAttempts > 0) handleAccusation()
          else if (item.type === 'cancel') setShowAccusation(false)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setShowAccusation(false)
        }
      } else if (showWitnesses && witnessNavActive) {
        const witnessButtons = crime.witnesses
          .map((_, i) => i)
          .filter(i => !witnessesViewed.includes(i))
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          if (selectedWitnessIndex >= witnessButtons.length - 1) {
            setWitnessNavActive(false)
            const suspectsIdx = availableClues.length + 1
            setSelectedFocusIndex(Math.min(suspectsIdx, focusableItems.length - 1))
          } else {
            setSelectedWitnessIndex(prev => prev + 1)
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          if (selectedWitnessIndex === 0) {
            setWitnessNavActive(false)
            const cluesIdx = Math.max(0, availableClues.length - 1)
            setSelectedFocusIndex(cluesIdx)
          } else {
            setSelectedWitnessIndex(prev => prev - 1)
          }
        } else if (e.key === 'Enter' && witnessButtons[selectedWitnessIndex] !== undefined) {
          e.preventDefault()
          handleViewWitness(witnessButtons[selectedWitnessIndex])
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setShowWitnesses(false)
          setWitnessNavActive(false)
        }
      } else if (showSuspects) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowSuspects(false)
        }
      } else {
        // Navegação por setas: pula entre itens focáveis (pistas + botões)
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedFocusIndex(prev => Math.min(prev + 1, focusableItems.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedFocusIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const item = focusableItems[selectedFocusIndex]
          if (!item) return
          if (item.type === 'clue') {
            handleDiscoverClue(availableClues[item.index].type)
          } else if (item.id === 'case') {
            setShowCaseView(true)
          } else if (item.id === 'accusation') {
            setShowAccusation(true)
          } else if (item.id === 'witnesses') {
            setShowWitnesses(true)
            setWitnessNavActive(true)
          } else if (item.id === 'suspects') {
            setShowSuspects(true)
          } else if (item.id === 'viewResult') {
            onViewResult()
          } else if (item.id === 'back') {
            onBack()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [showAccusation, accusationFocusIndex, selectedSuspect, selectedLocation, selectedMethod, selectedWitnessIndex, suspectsWithRecords, crime, canDiscoverMore, showWitnesses, witnessNavActive, showSuspects, isFailed, remainingAttempts, witnessesViewed, selectedFocusIndex, focusableItems, availableClues, handleAccusation, handleViewWitness, onViewWitness, onViewResult, onBack])

  if (showCaseView) {
    return <CaseView crime={crime} onBack={() => setShowCaseView(false)} />
  }

  return (
    <div className="investigation">
      <div className="terminal-header">
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
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
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
      </div>

      <div className="terminal-content">
        {/* Attempts counter */}
        <div className="section-title">
          TENTATIVAS: {maxAttempts > 3 ? currentAttempts : `${currentAttempts}/${maxAttempts} ${remainingAttempts > 0 ? `(${remainingAttempts} RESTANTES)` : '(ESGOTADAS)'}`}
        </div>

        {showViewResult && (
          <div className={`feedback ${state.solved ? 'success' : 'error'}`}>
            {state.solved ? 'CASO RESOLVIDO!' : 'CASO ENCERRADO. VOCE FALHOU.'}
          </div>
        )}

        {/* Clues Section */}
        <div className="clues-section">
          <div className="section-title progress-inline">
            PISTAS DISPONIVEIS: {revealedClues.length}/{crime.clues.length}
            <span className="progress-bar">{renderProgressBar(revealedClues.length, crime.clues.length)}</span>
          </div>

          {canDiscoverMore && (
            <div className="clue-selection">
              <div className="form-label">
                {showViewResult ? 'PISTAS NAO REVELADAS (visualizar nao altera estatisticas):' : 'ESCOLHA QUAL PISTA REVELAR:'}
              </div>
              <div className="form-options">
                {availableClues.map((clue, index) => {
                  const isSelected = titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.type === 'clue' && focusableItems[selectedFocusIndex]?.index === index
                  return (
                    <button
                      key={index}
                      className={`option-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDiscoverClue(clue.type)}
                      data-focused={isSelected ? 'true' : undefined}
                    >
                      &gt; {clue.type}..
                      {isSelected && (
                        <span className="cursor-blink" style={{
                          color: '#00FF66',
                          animation: 'blink 1s step-end infinite',
                          marginLeft: '4px'
                        }}>█</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {revealedClues.length > 0 && (
            <div className="clues-list">
              <div className="section-title">PISTAS REVELADAS:</div>
              {revealedClues.map((clue, index) => (
                <div key={index} className="clue-item">
                  <span className="clue-text">[{clue.type}]: {clue.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Witnesses Section */}
        <div className="witnesses-section">
          <div className="section-title progress-inline">
            TESTEMUNHAS: {witnessesViewed.length}/{crime.witnesses.length}
            <span className="progress-bar">{renderProgressBar(witnessesViewed.length, crime.witnesses.length)}</span>
          </div>

          {!showWitnesses && (
            <button 
              className="terminal-button" 
              onClick={() => { setShowWitnesses(true); setWitnessNavActive(true) }}
              data-focused={titleAnimationComplete && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'witnesses' ? 'true' : undefined}
            >
              &gt; VER TESTEMUNHAS
              {titleAnimationComplete && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'witnesses' && (
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              )}
            </button>
          )}

          {(showWitnesses || witnessesViewed.length === crime.witnesses.length) && (() => {
            const witnessButtons = crime.witnesses
              .map((_, i) => i)
              .filter(i => !witnessesViewed.includes(i))
            return (
            <div className="witnesses-list">
              {crime.witnesses.map((witness, index) => {
                const buttonIdx = witnessButtons.indexOf(index)
                const isFocused = !showAccusation && buttonIdx >= 0 && buttonIdx === selectedWitnessIndex
                return (
                  <div key={index} className="witness-item">
                    <div className="witness-header">
                      <span className="witness-name">
                        {witness.name}
                        {witness.cargo && (
                          <span className="witness-cargo"> ({witness.cargo})</span>
                        )}
                      </span>
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
                        className={`option-button ${isFocused ? 'selected' : ''}`}
                        onClick={() => handleViewWitness(index)}
                        data-focused={isFocused ? 'true' : undefined}
                      >
                        &gt; VER DEPOIMENTO
                        {isFocused && (
                          <span className="cursor-blink" style={{
                            color: '#00FF66',
                            animation: 'blink 1s step-end infinite',
                            marginLeft: '4px'
                          }}>█</span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            )
          })()}
        </div>

        {/* Suspects Database */}
        <div className="suspects-section">
          {!showSuspects ? (
            <button 
              className="terminal-button" 
              onClick={() => setShowSuspects(true)}
              data-focused={titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'suspects' ? 'true' : undefined}
            >
              &gt; BANCO DE DADOS DOS SUSPEITOS
              {titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'suspects' && (
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
                  <div className="suspect-name">
                    {suspect.displayName || suspect.name}
                    {suspect.cargo && (
                      <span className="suspect-cargo"> ({suspect.cargo})</span>
                    )}
                  </div>
                  <div className="suspect-record-text">
                    HISTORICO: {suspect.criminalRecord}
                  </div>
                  {suspect.comportamento && (
                    <div className="suspect-record-text">
                      COMPORTAMENTO: {suspect.comportamento}
                    </div>
                  )}
                  {suspect.caracteristica && (
                    <div className="suspect-record-text">
                      CARACTERISTICA: {suspect.caracteristica}
                    </div>
                  )}
                  {suspect.veiculo && (
                    <div className="suspect-record-text">
                      VEICULO: {suspect.veiculo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Case Description Section */}
        <div className="case-section">
          <button 
            className="terminal-button" 
            onClick={() => setShowCaseView(true)}
            data-focused={titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'case' ? 'true' : undefined}
          >
            &gt; CASO
            {titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'case' && (
              <span className="cursor-blink" style={{
                color: '#00FF66',
                animation: 'blink 1s step-end infinite',
                marginLeft: '4px'
              }}>█</span>
            )}
          </button>
        </div>

        {/* Hypothesis Section */}
        <div className="hypothesis-section">
          <div className="section-title">HIPOTESE ATUAL:</div>
          <div className="hypothesis-line">
            SUSPEITO: {showViewResult && state.hypothesis?.suspect ? state.hypothesis.suspect : (selectedSuspect || '?')}
          </div>
          <div className="hypothesis-line">
            LOCAL: {showViewResult && state.hypothesis?.location ? state.hypothesis.location : (selectedLocation || '?')}
          </div>
          <div className="hypothesis-line">
            METODO: {showViewResult && state.hypothesis?.method ? state.hypothesis.method : (selectedMethod || '?')}
          </div>
        </div>

        {/* Accusation Form */}
        {!showAccusation ? (
          <button 
            className="terminal-button"
            onClick={() => setShowAccusation(true)}
            style={{
              opacity: remainingAttempts <= 0 ? 0.85 : 1,
              cursor: 'pointer'
            }}
            data-focused={titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'accusation' ? 'true' : undefined}
          >
            &gt; FAZER ACUSACAO ({remainingAttempts > 0 ? `${remainingAttempts} TENTATIVA${remainingAttempts !== 1 ? 'S' : ''} RESTANTE${remainingAttempts !== 1 ? 'S' : ''}` : 'ESGOTADAS'})
            {titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'accusation' && (
              <span className="cursor-blink" style={{
                color: '#00FF66',
                animation: 'blink 1s step-end infinite',
                marginLeft: '4px'
              }}>█</span>
            )}
          </button>
        ) : showAccusation ? (
          (() => {
            const confirmIdx = suspectsWithRecords.length + crime.locations.length + crime.methods.length
            const cancelIdx = confirmIdx + 1
            let idx = 0
            return (
              <div className="accusation-form">
                <div className="form-group">
                  <div className="form-label">SUSPEITO:</div>
                  <div className="form-options">
                    {suspectsWithRecords.map((suspect) => {
                      const curIdx = idx++
                      const isFocused = accusationFocusIndex === curIdx
                      const suspectName = typeof suspect === 'object' ? (suspect.name ?? suspect.displayName ?? '') : String(suspect)
                      const suspectDisplay = typeof suspect === 'object' ? (suspect.displayName ?? suspect.name ?? '') : String(suspect)
                      return (
                        <button
                          key={String(suspectName)}
                          className={`option-button ${selectedSuspect === suspectName ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                          onClick={() => setSelectedSuspect(suspectName)}
                          data-focused={showAccusation && isFocused ? 'true' : undefined}
                        >
                          &gt; {String(suspectDisplay)}
                          {typeof suspect === 'object' && suspect.cargo ? ` (${String(suspect.cargo)})` : ''}
                          {isFocused && (
                            <span className="cursor-blink" style={{
                              color: '#00FF66',
                              animation: 'blink 1s step-end infinite',
                              marginLeft: '4px'
                            }}>█</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-label">LOCAL:</div>
                  <div className="form-options">
                    {crime.locations.map((location, locIdx) => {
                      const curIdx = idx++
                      const isFocused = accusationFocusIndex === curIdx
                      const locStr = typeof location === 'string' ? location : (location?.type ?? location?.name ?? location?.value ?? String(location ?? ''))
                      return (
                        <button
                          key={locIdx}
                          className={`option-button ${selectedLocation === locStr ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                          onClick={() => setSelectedLocation(locStr)}
                          data-focused={showAccusation && isFocused ? 'true' : undefined}
                        >
                          &gt; {locStr}
                          {isFocused && (
                            <span className="cursor-blink" style={{
                              color: '#00FF66',
                              animation: 'blink 1s step-end infinite',
                              marginLeft: '4px'
                            }}>█</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-label">METODO:</div>
                  <div className="form-options">
                    {crime.methods.map((method, methodIdx) => {
                      const curIdx = idx++
                      const isFocused = accusationFocusIndex === curIdx
                      const methodStr = typeof method === 'string' ? method : (method?.type ?? method?.name ?? method?.value ?? String(method ?? ''))
                      return (
                        <button
                          key={methodIdx}
                          className={`option-button ${selectedMethod === methodStr ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                          onClick={() => setSelectedMethod(methodStr)}
                          data-focused={showAccusation && isFocused ? 'true' : undefined}
                        >
                          &gt; {methodStr}
                          {isFocused && (
                            <span className="cursor-blink" style={{
                              color: '#00FF66',
                              animation: 'blink 1s step-end infinite',
                              marginLeft: '4px'
                            }}>█</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {feedback && (
                  <div className={`feedback ${feedback.includes('CORRETA') ? 'success' : feedback.includes('PERTO') ? 'warning' : 'error'}`}>
                    {feedback}
                  </div>
                )}

                <button 
                  className={`terminal-button highlight ${accusationFocusIndex === confirmIdx ? 'focused' : ''}`}
                  onClick={handleAccusation}
                  data-focused={showAccusation && accusationFocusIndex === confirmIdx ? 'true' : undefined}
                  style={{
                    opacity: remainingAttempts <= 0 ? 0.5 : 1,
                    cursor: remainingAttempts <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  &gt; CONFIRMAR ACUSACAO
                  {accusationFocusIndex === confirmIdx && (
                    <span className="cursor-blink" style={{
                      color: '#00FF66',
                      animation: 'blink 1s step-end infinite',
                      marginLeft: '4px'
                    }}>█</span>
                  )}
                </button>

                <button 
                  className={`terminal-button secondary ${accusationFocusIndex === cancelIdx ? 'focused' : ''}`}
                  onClick={() => setShowAccusation(false)}
                  data-focused={showAccusation && accusationFocusIndex === cancelIdx ? 'true' : undefined}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  &gt; CANCELAR
                  {accusationFocusIndex === cancelIdx && (
                    <span className="cursor-blink" style={{
                      color: '#00FF66',
                      animation: 'blink 1s step-end infinite',
                      marginLeft: '4px'
                    }}>█</span>
                  )}
                </button>
              </div>
            )
          })()
        ) : null}

        {/* Ver resultado - ao final, quando caso resolvido ou tentativas esgotadas */}
        {showViewResult && (
          <>
            <button 
              className="terminal-button highlight"
              onClick={onViewResult}
              data-focused={titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'viewResult' ? 'true' : undefined}
            >
              &gt; VER RESULTADO
              {titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'viewResult' && (
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              )}
            </button>
          </>
        )}

        <button 
          className="terminal-button secondary"
          onClick={onBack}
          data-focused={titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'back' ? 'true' : undefined}
        >
          &gt; VOLTAR AO INICIO
          {titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === 'back' && (
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
