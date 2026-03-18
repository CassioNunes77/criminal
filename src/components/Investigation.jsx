import { useState, useEffect, useRef, useCallback } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import CaseView from './CaseView'
import SuspectsView from './SuspectsView'
import WitnessesView from './WitnessesView'
import './Investigation.css'
import './Home.css'
import './InvestigationDos.css'

function Investigation({
  crime,
  state,
  onDiscoverClue,
  onViewWitness,
  onMakeAccusation,
  onBack,
  onViewResult,
  x7,
  fullDosMain = false,
  onSuspectsDbOpenChange,
  onWitnessesViewOpenChange,
  skipInvestigationTitleAnimation = false,
  onMarkInvestigationTitleIntroSeen
}) {
  const typewriterSoundRef = useRef(null)
  const lastClueRevealTimeRef = useRef(0)
  const lastNavWasKeyboardRef = useRef(false)
  const [showAccusation, setShowAccusation] = useState(false)
  const [selectedSuspect, setSelectedSuspect] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showWitnessesView, setShowWitnessesView] = useState(false)
  const witnessesViewed = state.witnessesViewed || []
  const [showSuspects, setShowSuspects] = useState(false)
  const [showCaseView, setShowCaseView] = useState(false)
  const [selectedFocusIndex, setSelectedFocusIndex] = useState(0)
  const [selectedClueIndex, setSelectedClueIndex] = useState(0)
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
    if (fullDosMain) return undefined
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [fullDosMain])

  // Ao sair da tela de investigação (voltar home, resultado, etc.), não repetir animação do título neste caso
  useEffect(() => {
    return () => {
      onMarkInvestigationTitleIntroSeen?.(crime.id)
    }
  }, [crime.id, onMarkInvestigationTitleIntroSeen])

  // Title animation - typewriter só na primeira entrada neste caso; depois texto completo direto
  useEffect(() => {
    const caseNum = crime.caseNumber || String(crime.id).slice(-3)
    const line1 = `Caso #${caseNum}`
    const line2 = crime.type || crime.title || ''
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const line3 = `${day}/${month}/1987`

    if (skipInvestigationTitleAnimation) {
      setTitleLine1(line1)
      setTitleLine2(line2)
      setTitleLine3(line3)
      setTitleAnimationComplete(true)
      return undefined
    }

    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    setTitleLine1('')
    setTitleLine2('')
    setTitleLine3('')
    setTitleAnimationComplete(false)

    let phase = 0
    let charIndex = 0
    let timeoutId = null

    const typeNext = () => {
      if (phase === 0) {
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
  }, [crime.id, crime.type, crime.title, skipInvestigationTitleAnimation])

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

  const topMenuButtons = [
    'investigation',
    ...(crime.witnesses?.length ? ['witnesses'] : []),
    'case',
    'suspects'
  ]

  const goToInvestigationMain = useCallback(() => {
    setShowWitnessesView(false)
    setShowAccusation(false)
  }, [])

  const actionButtons = [
    'accusation',
    ...(showViewResult ? ['viewResult'] : [])
  ]

  const menuButtonOrder = [...topMenuButtons, ...actionButtons]

  const focusableItems = [
    ...availableClues.map((c) => ({ type: 'clue', clueType: c.type })),
    ...menuButtonOrder.map(id => ({ type: 'button', id }))
  ]

  const lastClueFocusIndex = (() => {
    for (let i = focusableItems.length - 1; i >= 0; i--) {
      if (focusableItems[i].type === 'clue') return i
    }
    return 0
  })()

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
  }, [selectedFocusIndex, accusationFocusIndex, showAccusation, focusableItems])

  // Reset accusationFocusIndex ao abrir formulário de acusação
  useEffect(() => {
    if (showAccusation) setAccusationFocusIndex(0)
  }, [showAccusation])

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
      } else if (showCaseView || showWitnessesView) {
        /* CaseView / WitnessesView tratam o teclado */
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
            handleDiscoverClue(item.clueType)
          } else if (item.id === 'investigation') {
            goToInvestigationMain()
          } else if (item.id === 'case') {
            setShowCaseView(true)
          } else if (item.id === 'accusation') {
            setShowAccusation(true)
          } else if (item.id === 'witnesses') {
            setShowWitnessesView(true)
          } else if (item.id === 'suspects') {
            setShowSuspects(true)
          } else if (item.id === 'viewResult') {
            onViewResult()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [showAccusation, accusationFocusIndex, selectedSuspect, selectedLocation, selectedMethod, suspectsWithRecords, crime, canDiscoverMore, showCaseView, showWitnessesView, showSuspects, isFailed, remainingAttempts, witnessesViewed, selectedFocusIndex, focusableItems, availableClues, lastClueFocusIndex, handleAccusation, handleViewWitness, onViewWitness, onViewResult, onBack, goToInvestigationMain])

  useEffect(() => {
    onSuspectsDbOpenChange?.(showSuspects)
    return () => {
      if (showSuspects) onSuspectsDbOpenChange?.(false)
    }
  }, [showSuspects, onSuspectsDbOpenChange])

  useEffect(() => {
    onWitnessesViewOpenChange?.(showWitnessesView)
    return () => {
      if (showWitnessesView) onWitnessesViewOpenChange?.(false)
    }
  }, [showWitnessesView, onWitnessesViewOpenChange])

  if (showCaseView) {
    return <CaseView crime={crime} fullDosMain={fullDosMain} onBack={() => setShowCaseView(false)} />
  }

  if (showSuspects) {
    return (
      <SuspectsView
        crime={crime}
        suspectsWithRecords={suspectsWithRecords}
        fullDosMain={fullDosMain}
        onBack={() => setShowSuspects(false)}
      />
    )
  }

  if (showWitnessesView) {
    return (
      <WitnessesView
        crime={crime}
        witnessesViewed={witnessesViewed}
        onViewWitness={handleViewWitness}
        fullDosMain={fullDosMain}
        onBack={() => setShowWitnessesView(false)}
      />
    )
  }

  const handleMouseInteraction = () => {
    lastNavWasKeyboardRef.current = false
  }

  return (
    <div 
      className={fullDosMain ? 'investigation investigation-dos investigation-full-dos-main-root' : 'home home-dos investigation-dos'}
      onMouseDown={handleMouseInteraction} 
      onPointerDown={handleMouseInteraction}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: fullDosMain ? 'transparent' : '#000'
      }}
    >
      {!fullDosMain && (
        <div className="dos-top-bar">
          <div className="dos-top-line" />
          <div className="dos-clock">{currentTime}</div>
        </div>
      )}

      <div className={fullDosMain ? 'investigation-full-dos-main-row' : 'dos-main'}>
        {/* Painel esquerdo - arquivos e pastas */}
        <div className="dos-panel dos-panel-left">
          <div className="dos-file-list">
            {topMenuButtons.map((buttonId) => {
              const buttonLabels = {
                investigation: 'INVESTIGACAO.EXE',
                witnesses: 'TESTEMUNHAS.EXE',
                case: 'CASO.EXE',
                suspects: 'BANCO_SUSPEITOS.EXE'
              }
              const isFocused = titleAnimationComplete && !showAccusation && focusableItems[selectedFocusIndex]?.id === buttonId
              return (
                <button
                  key={buttonId}
                  type="button"
                  className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                  onClick={() => {
                    if (buttonId === 'investigation') goToInvestigationMain()
                    else if (buttonId === 'witnesses') setShowWitnessesView(true)
                    else if (buttonId === 'suspects') setShowSuspects(true)
                    else if (buttonId === 'case') setShowCaseView(true)
                  }}
                  data-focused={isFocused ? 'true' : undefined}
                  onMouseEnter={() => {
                    const idx = focusableItems.findIndex(item => item.id === buttonId)
                    if (idx >= 0) setSelectedFocusIndex(idx)
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
          
          {/* Pistas: todos os .DAT; revelados ficam visíveis e desabilitados */}
          {crime.clues.length > 0 && (
            <>
              <div className="dos-folder-sep" />
              <div className="dos-folder-list">
                <div className="dos-folder-item">PISTAS &gt;FOLDER&lt;</div>
                {crime.clues.map((clue) => {
                  const isRevealed = cluesRevealed.includes(clue.type)
                  const isFocused =
                    !isRevealed &&
                    titleAnimationComplete &&
                    !showAccusation &&
                    focusableItems[selectedFocusIndex]?.type === 'clue' &&
                    focusableItems[selectedFocusIndex]?.clueType === clue.type
                  if (isRevealed) {
                    return (
                      <button
                        key={clue.type}
                        type="button"
                        className="dos-file-item dos-file-clue-disabled"
                        disabled
                        aria-disabled="true"
                      >
                        {clue.type}.DAT
                      </button>
                    )
                  }
                  return (
                    <button
                      key={clue.type}
                      type="button"
                      className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                      onClick={() => handleDiscoverClue(clue.type)}
                      data-focused={isFocused ? 'true' : undefined}
                      onMouseEnter={() => {
                        const idx = focusableItems.findIndex((item) => item.type === 'clue' && item.clueType === clue.type)
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

          <div className="dos-menu-sep-line" aria-hidden />
          <div className="dos-file-list">
            {actionButtons.map((buttonId) => {
              const buttonLabels = {
                accusation: 'ACUSAÇÃO.EXE',
                viewResult: 'RESULTADO.EXE'
              }
              const isFocused = titleAnimationComplete && !showAccusation && focusableItems[selectedFocusIndex]?.id === buttonId
              return (
                <button
                  key={buttonId}
                  type="button"
                  className={`dos-file-item ${isFocused ? 'dos-file-selected' : ''}`}
                  onClick={() => {
                    if (buttonId === 'accusation') setShowAccusation(true)
                    else if (buttonId === 'viewResult') onViewResult()
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

          <div className="dos-menu-sep-line" aria-hidden />

          {/* Hipótese atual */}
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
            <div className="dos-mission-content investigation-content investigation-case-closed">
              <div className="dos-mission-title">CASO ENCERRADO</div>
              <div className="dos-mission-case">
                CASO #{crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · {crime.type || 'CRIME'}
              </div>
              <div className="dos-mission-description investigation-case-closed-body">
                <div className={`case-closed-feedback feedback ${state.solved ? 'success' : 'error'}`}>
                  {state.solved ? 'CASO RESOLVIDO COM SUCESSO!' : 'CASO ENCERRADO. VOCE FALHOU.'}
                </div>
                <div className="case-closed-section-title">RESULTADO FINAL</div>
                <div className="case-closed-hypothesis-box">
                  <div className="case-closed-box-title">HIPOTESE CORRETA</div>
                  <div className="case-closed-line">SUSPEITO: {state.hypothesis?.suspect || 'N/A'}</div>
                  <div className="case-closed-line">LOCAL: {state.hypothesis?.location || 'N/A'}</div>
                  <div className="case-closed-line">METODO: {state.hypothesis?.method || 'N/A'}</div>
                </div>
                <div className="case-closed-status">
                  TENTATIVAS UTILIZADAS: {currentAttempts}/{maxAttempts}
                </div>
                <div className="case-closed-status">
                  PRECISAO FINAL: {Math.max(0, 100 - (revealedClues.length * 5) - (witnessesViewed.length * 3) - (currentAttempts * 10))}%
                </div>
                <div className="case-closed-actions">
                  <button type="button" className="dos-mission-btn dos-file-selected" onClick={onBack}>
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
            
            {/* Status e tentativas / formulário de acusação */}
            <div className="dos-mission-description">
              {showAccusation ? (() => {
                const nS = suspectsWithRecords.length
                const nL = crime.locations.length
                const nM = crime.methods.length
                const iConfirm = nS + nL + nM
                const iCancel = iConfirm + 1
                const suspectVal = (s) => (typeof s === 'object' ? (s.name ?? s.displayName ?? '') : String(s))
                const locVal = (l) => (typeof l === 'string' ? l : (l?.type ?? l?.name ?? l?.value ?? ''))
                const metVal = (m) => (typeof m === 'string' ? m : (m?.type ?? m?.name ?? m?.value ?? ''))
                return (
                  <div className="accusation-form-dos">
                    <div className="accusation-title">ACUSAÇÃO — SELECIONE SUSPEITO, LOCAL E MÉTODO</div>

                    <div className="form-group">
                      <div className="form-label">SUSPEITO</div>
                      <div className="form-options">
                        {suspectsWithRecords.map((s, i) => {
                          const value = suspectVal(s)
                          const focused = accusationFocusIndex === i
                          const picked = (selectedSuspect ?? '').trim() === value.trim()
                          return (
                            <button
                              type="button"
                              key={`acc-s-${i}`}
                              className={`option-button ${focused ? 'selected' : ''} ${picked ? 'accusation-picked' : ''}`}
                              onClick={() => {
                                setAccusationFocusIndex(i)
                                setSelectedSuspect(value)
                              }}
                            >
                              {picked ? '[*] ' : '> '}{value}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="form-label">LOCAL</div>
                      <div className="form-options">
                        {crime.locations.map((l, i) => {
                          const idx = nS + i
                          const value = locVal(l)
                          const focused = accusationFocusIndex === idx
                          const picked = (selectedLocation ?? '').trim() === value.trim()
                          return (
                            <button
                              type="button"
                              key={`acc-l-${i}`}
                              className={`option-button ${focused ? 'selected' : ''} ${picked ? 'accusation-picked' : ''}`}
                              onClick={() => {
                                setAccusationFocusIndex(idx)
                                setSelectedLocation(value)
                              }}
                            >
                              {picked ? '[*] ' : '> '}{value}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="form-label">MÉTODO</div>
                      <div className="form-options">
                        {crime.methods.map((m, i) => {
                          const idx = nS + nL + i
                          const value = metVal(m)
                          const focused = accusationFocusIndex === idx
                          const picked = (selectedMethod ?? '').trim() === value.trim()
                          return (
                            <button
                              type="button"
                              key={`acc-m-${i}`}
                              className={`option-button ${focused ? 'selected' : ''} ${picked ? 'accusation-picked' : ''}`}
                              onClick={() => {
                                setAccusationFocusIndex(idx)
                                setSelectedMethod(value)
                              }}
                            >
                              {picked ? '[*] ' : '> '}{value}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="form-group accusation-actions-dos">
                      <button
                        type="button"
                        className={`terminal-button ${accusationFocusIndex === iConfirm ? 'highlight' : ''}`}
                        onClick={() => {
                          setAccusationFocusIndex(iConfirm)
                          if (selectedSuspect && selectedLocation && selectedMethod && remainingAttempts > 0) {
                            handleAccusation()
                          }
                        }}
                        style={{ opacity: remainingAttempts <= 0 ? 0.5 : 1 }}
                      >
                        CONFIRMAR ACUSAÇÃO
                      </button>
                      <button
                        type="button"
                        className={`terminal-button secondary ${accusationFocusIndex === iCancel ? 'highlight' : ''}`}
                        onClick={() => {
                          setAccusationFocusIndex(iCancel)
                          setShowAccusation(false)
                          setFeedback(null)
                        }}
                      >
                        CANCELAR
                      </button>
                    </div>

                    {feedback && (
                      <div className={`accusation-feedback ${feedback.includes('CORRETA') ? 'success' : feedback.includes('PERTO') ? 'warning' : 'error'}`}>
                        {feedback}
                      </div>
                    )}
                  </div>
                )
              })() : (
              <>
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
              
              {crime.witnesses?.length > 0 && (
                <div className="witnesses-hint-dos" style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  TESTEMUNHAS: {witnessesViewed.length}/{crime.witnesses.length} depoimentos registrados — abra{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>TESTEMUNHAS.EXE</strong> no menu.
                </div>
              )}
              </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {!fullDosMain && (
        <div className="dos-bottom-bar">
          {!showAccusation && (
            <div className="dos-prompt">
              <div className="dos-version">
                NEXO TERMINAL v1.0 · PRECISAO: {Math.max(0, 100 - (revealedClues.length * 5) - (witnessesViewed.length * 3) - (currentAttempts * 10))}%
              </div>
            </div>
          )}
        </div>
      )}
      {fullDosMain && !showAccusation && (
        <div className="investigation-embedded-precision">
          PRECISAO: {Math.max(0, 100 - (revealedClues.length * 5) - (witnessesViewed.length * 3) - (currentAttempts * 10))}%
        </div>
      )}
    </div>
  )
}

export default Investigation
