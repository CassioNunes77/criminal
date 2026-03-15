import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import CaseView from './CaseView'
import './Investigation.css'
import './Home.css'
import './InvestigationDos.css'

function Investigation({ crime, state, onDiscoverClue, onViewWitness, onMakeAccusation, onBack, onViewResult, x7 }) {
  const typewriterSoundRef = useRef(null)
  const lastClueRevealTimeRef = useRef(0)
  const lastNavWasKeyboardRef = useRef(false)
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
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === 'undefined') return '00:00'
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

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
    const line3 = `${day}/${month}/1987`

    setTitleLine1('')
    setTitleLine2('')
    setTitleLine3('')
    setTitleAnimationComplete(false)

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
        // Line 3: date (dd/mm/1987)
        if (charIndex < line3.length) {
          if (line3[charIndex] !== '/') typewriterSoundRef.current?.play()
          setTitleLine3(line3.slice(0, charIndex + 1))
          charIndex++
          timeoutId = setTimeout(typeNext, 30)
        } else {
          setTitleAnimationComplete(true)
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

  // Desktop: scroll sincronizado com o cursor APENAS ao navegar com setas (não ao clicar com mouse)
  useEffect(() => {
    if (window.innerWidth < 769) return
    if (!lastNavWasKeyboardRef.current) return
    if (Date.now() - lastClueRevealTimeRef.current < 200) return
    const focusedItem = focusableItems[selectedFocusIndex]
    if (focusedItem?.type === 'clue') return
    const el = document.querySelector('.investigation .terminal-content [data-focused="true"]')
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    lastNavWasKeyboardRef.current = false
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
          lastNavWasKeyboardRef.current = true
          setAccusationFocusIndex(prev => Math.min(prev + 1, accItems.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          lastNavWasKeyboardRef.current = true
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
          lastNavWasKeyboardRef.current = true
          if (selectedWitnessIndex >= witnessButtons.length - 1) {
            setWitnessNavActive(false)
            const suspectsIdx = availableClues.length + 1
            setSelectedFocusIndex(Math.min(suspectsIdx, focusableItems.length - 1))
          } else {
            setSelectedWitnessIndex(prev => prev + 1)
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          lastNavWasKeyboardRef.current = true
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
          lastNavWasKeyboardRef.current = true
          setSelectedFocusIndex(prev => Math.min(prev + 1, focusableItems.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          lastNavWasKeyboardRef.current = true
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

  const handleMouseInteraction = () => {
    lastNavWasKeyboardRef.current = false
  }

  return (
    <div 
      className="home home-dos investigation-dos"
      onMouseDown={handleMouseInteraction} 
      onPointerDown={handleMouseInteraction}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: '#000'
      }}
    >
      {/* Top bar - linha superior + relógio */}
      <div className="dos-top-bar">
        <div className="dos-top-line" />
        <div className="dos-clock">{currentTime}</div>
      </div>

      {/* Conteúdo principal - dois painéis */}
      <div className="dos-main">
        {/* Painel esquerdo - arquivos e pastas */}
        <div className="dos-panel dos-panel-left">
          <div className="dos-file-list">
            {mainButtons.map((buttonId, index) => {
              const buttonLabels = {
                witnesses: 'TESTEMUNHAS.EXE',
                suspects: 'SUSPEITOS.EXE',
                case: 'CASO.EXE',
                viewResult: 'RESULTADO.EXE',
                back: 'VOLTAR.EXE'
              }
              const isFocused = titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === buttonId
              return (
                <button
                  key={buttonId}
                  className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                  onClick={() => {
                    if (buttonId === 'witnesses') { setShowWitnesses(true); setWitnessNavActive(true) }
                    else if (buttonId === 'suspects') setShowSuspects(true)
                    else if (buttonId === 'case') setShowCaseView(true)
                    else if (buttonId === 'accusation') setShowAccusation(true)
                    else if (buttonId === 'viewResult') onViewResult()
                    else if (buttonId === 'back') onBack()
                  }}
                  data-focused={isFocused ? 'true' : undefined}
                  onMouseEnter={() => {
                    const idx = focusableItems.findIndex(item => item.id === buttonId)
                    if (idx >= 0) setSelectedFocusIndex(idx)
                  }}
                  style={{
                    opacity: buttonId === 'accusation' && remainingAttempts <= 0 ? 0.5 : 1,
                    cursor: buttonId === 'accusation' && remainingAttempts <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {buttonLabels[buttonId]}
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
          
          {/* Pistas disponíveis */}
          {canDiscoverMore && (
            <>
              <div className="dos-folder-sep" />
              <div className="dos-folder-list">
                <div className="dos-folder-item">PISTAS &gt;FOLDER&lt;</div>
                {availableClues.map((clue, index) => {
                  const isFocused = titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.type === 'clue' && focusableItems[selectedFocusIndex]?.index === index
                  return (
                    <button
                      key={index}
                      className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                      onClick={() => handleDiscoverClue(clue.type)}
                      data-focused={isFocused ? 'true' : undefined}
                      onMouseEnter={() => {
                        const idx = focusableItems.findIndex(item => item.type === 'clue' && item.index === index)
                        if (idx >= 0) setSelectedFocusIndex(idx)
                      }}
                    >
                      {clue.type}.DAT
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
            </>
          )}
          
          <div className="dos-folder-sep" />
          <div className="dos-folder-list">
            <div className="dos-folder-item">SYSTEM &gt;FOLDER&lt;</div>
            <div className="dos-folder-item">SETTINGS &gt;FOLDER&lt;</div>
          </div>
          
          {/* Botão ACUSAÇÃO */}
          <div className="dos-folder-sep" />
          <div className="dos-file-list">
            {(() => {
              const buttonId = 'accusation'
              const isFocused = titleAnimationComplete && !showWitnesses && !showAccusation && focusableItems[selectedFocusIndex]?.id === buttonId
              return (
                <button
                  key={buttonId}
                  className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                  onClick={() => {
                    if (buttonId === 'accusation') setShowAccusation(true)
                  }}
                  data-focused={isFocused ? 'true' : undefined}
                  onMouseEnter={() => {
                    const idx = focusableItems.findIndex(item => item.id === buttonId)
                    if (idx >= 0) setSelectedFocusIndex(idx)
                  }}
                  style={{
                    opacity: buttonId === 'accusation' && remainingAttempts <= 0 ? 0.5 : 1,
                    cursor: buttonId === 'accusation' && remainingAttempts <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ACUSAÇÃO.EXE
                  {isFocused && (
                    <span className="cursor-blink" style={{
                      color: '#00FF66',
                      animation: 'blink 1s step-end infinite',
                      marginLeft: '4px'
                    }}>█</span>
                  )}
                </button>
              )
            })()}
          </div>
          
          {/* Campos de acusação quando ativo */}
          {showAccusation && (
            <>
              <div className="dos-folder-sep" />
              <div className="dos-folder-list">
                <div className="dos-folder-item">ACUSACAO &gt;FOLDER&lt;</div>
                <div className="accusation-item">
                  SUSPEITO: {selectedSuspect || 'SELECIONAR'}
                </div>
                <div className="accusation-item">
                  LOCAL: {selectedLocation || 'SELECIONAR'}
                </div>
                <div className="accusation-item">
                  METODO: {selectedMethod || 'SELECIONAR'}
                </div>
                {feedback && (
                  <div className={`accusation-feedback ${feedback.includes('CORRETA') ? 'success' : feedback.includes('PERTO') ? 'warning' : 'error'}`}>
                    {feedback}
                  </div>
                )}
              </div>
              <div className="dos-folder-sep" />
              <div className="dos-file-list">
                <button
                  className="dos-file-item"
                  onClick={() => {
                    if (selectedSuspect && selectedLocation && selectedMethod && remainingAttempts > 0) {
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
                  }}
                  style={{
                    opacity: remainingAttempts <= 0 ? 0.5 : 1,
                    cursor: remainingAttempts <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  CONFIRMAR.EXE
                </button>
                <button
                  className="dos-file-item"
                  onClick={() => {
                    setShowAccusation(false)
                    setFeedback(null)
                  }}
                >
                  VOLTAR.EXE
                </button>
              </div>
            </>
          )}
          
          {/* Hipótese atual */}
          <div className="dos-folder-sep" />
          <div className="dos-folder-list">
            <div className="dos-folder-item">HIPOTESE &gt;FOLDER&lt;</div>
            <div className="hypothesis-item">
              SUSPEITO: {showViewResult && state.hypothesis?.suspect ? state.hypothesis.suspect : (selectedSuspect || '?')}
            </div>
            <div className="hypothesis-item">
              LOCAL: {showViewResult && state.hypothesis?.location ? state.hypothesis.location : (selectedLocation || '?')}
            </div>
            <div className="hypothesis-item">
              METODO: {showViewResult && state.hypothesis?.method ? state.hypothesis.method : (selectedMethod || '?')}
            </div>
          </div>
        </div>

        {/* Painel direito - conteúdo da investigação ou tela de caso encerrado */}
        <div className="dos-panel dos-panel-right">
          {showViewResult ? (
            <div className="dos-mission-content investigation-content">
              <div className="dos-mission-title">CASO ENCERRADO</div>
              <div className="dos-mission-case">
                CASO #{crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · {crime.type || 'CRIME'}
              </div>
              <div className="dos-mission-description">
                <div className={`feedback ${state.solved ? 'success' : 'error'}`} style={{ fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  {state.solved ? 'CASO RESOLVIDO COM SUCESSO!' : 'CASO ENCERRADO. VOCE FALHOU.'}
                </div>
                
                <div className="section-title" style={{ textAlign: 'center', marginBottom: '12px' }}>RESULTADO FINAL:</div>
                
                <div className="hypothesis-section" style={{ border: '1px solid var(--text-secondary)', padding: '12px', margin: '0' }}>
                  <div className="section-title">HIPOTESE CORRETA:</div>
                  <div className="hypothesis-line">
                    SUSPEITO: {state.hypothesis?.suspect || 'N/A'}
                  </div>
                  <div className="hypothesis-line">
                    LOCAL: {state.hypothesis?.location || 'N/A'}
                  </div>
                  <div className="hypothesis-line">
                    METODO: {state.hypothesis?.method || 'N/A'}
                  </div>
                </div>
                
                <div className="status-line" style={{ textAlign: 'center', marginTop: '16px' }}>
                  TENTATIVAS UTILIZADAS: {currentAttempts}/{maxAttempts}
                </div>
                
                <div className="status-line" style={{ textAlign: 'center', marginTop: '8px' }}>
                  PRECISAO FINAL: {Math.max(0, 100 - (revealedClues.length * 5) - (witnessesViewed.length * 3) - (currentAttempts * 10))}%
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    className="dos-mission-btn dos-file-selected"
                    onClick={onBack}
                  >
                    VOLTAR
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dos-mission-content investigation-content">
            {/* Header com título do caso */}
            <div className="dos-mission-title">
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
            
            {/* Status e tentativas */}
            <div className="dos-mission-description">
              <div className="status-line">
                TENTATIVAS: {maxAttempts > 3 ? currentAttempts : `${currentAttempts}/${maxAttempts} ${remainingAttempts > 0 ? `(${remainingAttempts} RESTANTES)` : '(ESGOTADAS)'}`}
              </div>
              
              {showViewResult && (
                <div className={`feedback ${state.solved ? 'success' : 'error'}`}>
                  {state.solved ? 'CASO RESOLVIDO!' : 'CASO ENCERRADO. VOCE FALHOU.'}
                </div>
              )}

              {/* Pistas reveladas */}
              {revealedClues.length > 0 && (
                <div className="revealed-clues">
                  <div className="section-title">PISTAS REVELADAS ({revealedClues.length}/{crime.clues.length}):</div>
                  {revealedClues.map((clue, index) => (
                    <div key={index} className="clue-item">
                      <span className="clue-text">[{clue.type}]: {clue.text}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Testemunhas */}
              {(showWitnesses || witnessesViewed.length > 0) && (
                <div className="witnesses-content">
                  <div className="section-title">TESTEMUNHAS ({witnessesViewed.length}/{crime.witnesses.length}):</div>
                  {crime.witnesses.map((witness, index) => {
                    const buttonIdx = crime.witnesses.map((_, i) => i).filter(i => !witnessesViewed.includes(i)).indexOf(index)
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
              )}
              
              {/* Suspeitos */}
              {showSuspects && (
                <div className="suspects-content">
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
          </div>
        </div>
      </div>

      {/* Barra inferior - apenas versão quando não em acusação */}
      <div className="dos-bottom-bar">
        {!showAccusation && (
          <div className="dos-prompt">
            <div className="dos-version">
              NEXO TERMINAL v1.0 · PRECISAO: {Math.max(0, 100 - (revealedClues.length * 5) - (witnessesViewed.length * 3) - (currentAttempts * 10))}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Investigation
