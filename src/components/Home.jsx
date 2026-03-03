import { useState, useEffect, useRef } from 'react'
import './Home.css'
import { TypewriterSound } from '../utils/typewriterSound'

function Home({ crime, streak, onStart, onAcceptMission, onShowStats }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const bufRef = useRef([])
  const [aboutLines, setAboutLines] = useState([])
  const [infoLines, setInfoLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [aboutComplete, setAboutComplete] = useState(false)
  const [infoComplete, setInfoComplete] = useState(false)
  const [selectedButton, setSelectedButton] = useState(0) // 0 = iniciar, 1 = arquivo, 2 = info
  const [showMissionPreview, setShowMissionPreview] = useState(false)
  const [missionButtonSelected, setMissionButtonSelected] = useState(0) // 0 = aceitar, 1 = recusar
  const [commandInput, setCommandInput] = useState('')
  const x7ActiveRef = useRef(false)
  const [crtGlitch, setCrtGlitch] = useState(false)
  const [crtFlicker, setCrtFlicker] = useState(false)
  const [crtDistortion, setCrtDistortion] = useState(0)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)
  const [isLandscape, setIsLandscape] = useState(typeof window !== 'undefined' && window.innerWidth > window.innerHeight)
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === 'undefined') return '00:00'
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })
  const commandInputRef = useRef(null)
  const prevCommandRef = useRef('')
  const typewriterSoundRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const isMobileLandscape = !isDesktop && isLandscape
  const isCommandLineMode = isDesktop || isMobileLandscape

  const chk = () => {
    const k = [0x23, 0x2a, 0x4e, 0x45, 0x58, 0x4f, 0x37, 0x37]
    const b = bufRef.current
    if (b.length < 8 || window.innerWidth < 768) return false
    return b.slice(-8).every((c, i) => (c.charCodeAt?.(0) ?? 0) === k[i])
  }

  const completeAboutAnimation = () => {
    if (aboutComplete) return
    if (window.__cancelAboutAnimation) {
      window.__cancelAboutAnimation()
    }
    const allLines = [
      'SYSTEM BOOT SEQUENCE INITIATED...',
      'ARQUIVO DE ACESSO RESTRITO CARREGADO....',
      'ANO 1987.',
      '',
      'Você é um(a) investigador(a) de uma divisão secreta de inteligência policial, especializado(a) em análise de dados e invasão autorizada de sistemas usados por organizações criminosas.',
      '',
      'Seu trabalho acontece dentro de redes fechadas e bancos de dados sigilosos, onde todos os dias um novo caso chega ao seu terminal contendo registros incompletos e pistas fragmentadas.',
      '',
      'Apenas padroes, acessos, horarios e erros deixados por quem acreditou nunca ser rastreado.',
      '',
      'Sua função é cruzar informações, reconstruir eventos e identificar a verdade antes que os dados desapareçam.',
      '',
      'Cada crime deve ser resolvido usando lógica, observação e interpretação fria dos fatos.',
      '',
      'Sem ação direta, apenas você, o sistema e a mente por trás do crime.',
      '',
      'ACESSO CONCEDIDO.',
      'AGUARDANDO PRÓXIMO CASO.'
    ]
    const linesNoSpacing = allLines.filter(line => line !== '')
    setAboutLines(linesNoSpacing)
    setCurrentLineIndex(linesNoSpacing.length - 1)
    setDots('')
    setAboutComplete(true)
  }

  const INFO_LINES = [
    'The Nexo Personal Computer DOS Version 1.00 (C)Copyright Nexo Corp 1981',
    '',
    '',
    '',
    'INFORMATIVO',
    '',
    'Um novo caso foi atribuido a voce. Apresente-se ao terminal.',
    '',
    'PISTAS: Sao 7 tipos. Voce escolhe qual revelar primeiro.',
    '',
    'TESTEMUNHAS: 5 depoimentos. Alguns podem ser falsos. Analise com cuidado.',
    '',
    'SUSPEITOS: 4 suspeitos com nome e historico criminal. Um é o culpado.',
    '',
    'OBJETIVO: Identificar o suspeito, o local exato do crime e o metodo utilizado.',
    '',
    'TENTATIVAS: Voce tem ate 3 acusacoes. Cada erro conta.',
    '',
    'PRECISAO: Comeca em 100%. Diminui conforme usa pistas, testemunhas e tentativas.',
    '',
    'MODO OFFLINE: Caso do dia em cache permite jogar sem internet. Sem cache, reconecte.',
    '',
    'BOM TRABALHO, AGENTE.'
  ]

  const completeInfoAnimation = () => {
    if (infoComplete) return
    if (window.__cancelInfoAnimation) {
      window.__cancelInfoAnimation()
    }
    const linesNoSpacing = INFO_LINES.filter(line => line !== '')
    setInfoLines(linesNoSpacing)
    setCurrentLineIndex(linesNoSpacing.length - 1)
    setDots('')
    setInfoComplete(true)
  }

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 768)
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Auto-focus input to show keyboard on mobile landscape
  useEffect(() => {
    if (isMobileLandscape && titleAnimationComplete) {
      const t = setTimeout(() => commandInputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [isMobileLandscape, titleAnimationComplete])

  useEffect(() => {
    // Initialize typewriter sound for title
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
      
      // Resume audio context if suspended (required by some browsers)
      if (typewriterSoundRef.current.audioContext && typewriterSoundRef.current.audioContext.state === 'suspended') {
        typewriterSoundRef.current.audioContext.resume()
      }
    }

    const text = `NEXO TERMINAL v1.0`
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        // Play typewriter sound for each character (except spaces)
        if (text[index] !== ' ') {
          // Ensure audio context is resumed
          if (typewriterSoundRef.current?.audioContext?.state === 'suspended') {
            typewriterSoundRef.current.audioContext.resume()
          }
          typewriterSoundRef.current?.play()
        }
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setShowCursor(false)
          setTitleAnimationComplete(true)
        }, 500)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // CRT monitor glitch effects - intensificados para simulação de monitor velho
  useEffect(() => {
    if (showAbout) return // Don't apply glitches on about screen

    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.45) {
        setCrtGlitch(true)
        setTimeout(() => setCrtGlitch(false), 100 + Math.random() * 200)
      }
    }, 1000 + Math.random() * 1500)

    const flickerInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        setCrtFlicker(true)
        setTimeout(() => setCrtFlicker(false), 40 + Math.random() * 80)
      }
    }, 500 + Math.random() * 800)

    const distortionInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setCrtDistortion(3 + Math.random() * 5)
        setTimeout(() => setCrtDistortion(0), 200 + Math.random() * 400)
      }
    }, 1500 + Math.random() * 2500)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(flickerInterval)
      clearInterval(distortionInterval)
    }
  }, [showAbout])

  // Keyboard: desktop = command-line mode, mobile = arrow keys, mission = Aceitar/Recusar
  useEffect(() => {
    if (showAbout || showInfo) return

    const handleKeyDown = (e) => {
      // Quando em preview de missão: Aceitar/Recusar
      if (showMissionPreview) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setMissionButtonSelected(1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setMissionButtonSelected(0)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (missionButtonSelected === 0) {
            onAcceptMission?.(x7ActiveRef.current || chk() ? { x: 1 } : undefined)
          } else {
            setShowMissionPreview(false)
          }
        }
        return
      }

      // Skip when input is focused (mobile landscape) - input handles typing
      if (isMobileLandscape && commandInputRef.current?.contains?.(document.activeElement)) {
        return
      }
      if (e.key?.length === 1) {
        bufRef.current = [...bufRef.current.slice(-15), e.key].slice(-8)
      }

      if (isCommandLineMode) {
        // Command-line mode: type command, Enter to execute
        if (e.key === 'Enter') {
          e.preventDefault()
          const cmd = commandInput.trim().toUpperCase()
          const cmdLower = commandInput.trim().toLowerCase()
          if (cmd === 'INICIAR' || cmd === 'INICIAR.EXE') {
            setShowMissionPreview(true)
          } else if (cmd === 'ARQUIVO' || cmd === 'ARQUIVO.TXT') {
            setShowAbout(true)
          } else if (cmd === 'INFO' || cmd === 'INFO.TXT') {
            setShowInfo(true)
          } else if (cmd === '#*NEXO77') {
            x7ActiveRef.current = true
          } else if (onShowStats && cmdLower === (typeof atob !== 'undefined' ? atob('c3RhdHM3Nw==') : 'stats77')) {
            onShowStats()
          }
          prevCommandRef.current = ''
          setCommandInput('')
        } else if (e.key === 'Backspace') {
          e.preventDefault()
          setCommandInput(prev => prev.slice(0, -1))
        } else if (e.key?.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          setCommandInput(prev => prev + e.key)
        }
      } else {
        // Mobile: arrow keys + Enter
        const fileCount = onShowStats ? 4 : 3
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedButton(prev => (prev + 1) % fileCount)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedButton(prev => (prev - 1 + fileCount) % fileCount)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (selectedButton === 0) {
            setShowMissionPreview(true)
          } else if (selectedButton === 1) {
            setShowAbout(true)
          } else if (selectedButton === 2) {
            setShowInfo(true)
          } else if (selectedButton === 3 && onShowStats) {
            onShowStats()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAbout, showInfo, showMissionPreview, missionButtonSelected, selectedButton, onAcceptMission, onShowStats, isCommandLineMode, isMobileLandscape, commandInput])

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    // Handle Enter key - skip animation if typing, go back if complete
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (showAbout) {
          if (!aboutComplete) {
            completeAboutAnimation()
          } else {
            setShowAbout(false)
          }
        } else if (showInfo) {
          if (!infoComplete) {
            completeInfoAnimation()
          } else {
            setShowInfo(false)
          }
        }
      }
    }

    if (showAbout || showInfo) {
      window.addEventListener('keydown', handleKeyPress)
      return () => {
        window.removeEventListener('keydown', handleKeyPress)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [showAbout, showInfo, aboutComplete, infoComplete])

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    if (showAbout) {
      setAboutLines([])
      setCurrentLineIndex(0)
      setDots('')
      setAboutComplete(false)

      const lines = [
        'SYSTEM BOOT SEQUENCE INITIATED...',
        'ARQUIVO DE ACESSO RESTRITO CARREGADO....',
        'ANO 1987.',
        '',
        'Você é um(a) investigador(a) de uma divisão secreta de inteligência policial, especializado(a) em análise de dados e invasão autorizada de sistemas usados por organizações criminosas.',
        '',
        'Seu trabalho acontece dentro de redes fechadas e bancos de dados sigilosos, onde todos os dias um novo caso chega ao seu terminal contendo registros incompletos e pistas fragmentadas.',
        '',
        'Apenas padroes, acessos, horarios e erros deixados por quem acreditou nunca ser rastreado.',
        '',
        'Sua função é cruzar informações, reconstruir eventos e identificar a verdade antes que os dados desapareçam.',
        '',
        'Cada crime deve ser resolvido usando lógica, observação e interpretação fria dos fatos.',
        '',
        'Sem ação direta, apenas você, o sistema e a mente por trás do crime.',
        '',
        'ACESSO CONCEDIDO.',
        'AGUARDANDO PRÓXIMO CASO.'
      ]

      let lineIndex = 0
      let charIndex = 0
      let dotsCount = 0
      let timeoutId = null
      let isCancelled = false

      const showDots = () => {
        if (isCancelled || aboutComplete) return // Stop if animation was cancelled
        if (dotsCount < 3) {
          setDots('.'.repeat(dotsCount + 1))
          dotsCount++
          timeoutId = setTimeout(showDots, 300)
        } else {
          setDots('')
          dotsCount = 0
          lineIndex++
          if (lineIndex < lines.length) {
            setCurrentLineIndex(lineIndex)
            charIndex = 0
            timeoutId = setTimeout(typeLine, 50)
          } else {
            setAboutComplete(true)
          }
        }
      }

      const typeLine = () => {
        if (isCancelled || aboutComplete) return // Stop if animation was cancelled
        if (lineIndex >= lines.length) {
          setAboutComplete(true)
          return
        }

        const currentLine = lines[lineIndex]
        
        if (currentLine === '') {
          timeoutId = setTimeout(showDots, 200)
          return
        }

        if (charIndex < currentLine.length) {
          // Play typewriter sound for each character (except spaces)
          if (currentLine[charIndex] !== ' ') {
            typewriterSoundRef.current?.play()
          }
          
          setAboutLines(prev => {
            const newLines = [...prev]
            if (!newLines[lineIndex]) {
              newLines[lineIndex] = ''
            }
            newLines[lineIndex] = currentLine.slice(0, charIndex + 1)
            return newLines
          })
          charIndex++
          timeoutId = setTimeout(typeLine, 20)
        } else {
          if (lineIndex < lines.length - 1) {
            timeoutId = setTimeout(showDots, 300)
          } else {
            setAboutComplete(true)
          }
        }
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (!isCancelled) {
          setCurrentLineIndex(0)
          typeLine()
        }
      }, 500)

      // Store cancellation function
      const cancelAnimation = () => {
        isCancelled = true
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      // Expose cancel function for Enter key handler
      window.__cancelAboutAnimation = cancelAnimation

      return () => {
        cancelAnimation()
        delete window.__cancelAboutAnimation
      }
    } else {
      setAboutLines([])
      setCurrentLineIndex(0)
      setDots('')
      setAboutComplete(false)
    }
  }, [showAbout])

  // Info screen animation
  useEffect(() => {
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    if (showInfo) {
      setInfoLines([])
      setCurrentLineIndex(0)
      setDots('')
      setInfoComplete(false)

      const lines = INFO_LINES
      let lineIndex = 0
      let charIndex = 0
      let dotsCount = 0
      let timeoutId = null
      let isCancelled = false

      const showDots = () => {
        if (isCancelled || infoComplete) return
        if (dotsCount < 3) {
          setDots('.'.repeat(dotsCount + 1))
          dotsCount++
          timeoutId = setTimeout(showDots, 300)
        } else {
          setDots('')
          dotsCount = 0
          lineIndex++
          if (lineIndex < lines.length) {
            setCurrentLineIndex(lineIndex)
            charIndex = 0
            timeoutId = setTimeout(typeLine, 50)
          } else {
            setInfoComplete(true)
          }
        }
      }

      const typeLine = () => {
        if (isCancelled || infoComplete) return
        if (lineIndex >= lines.length) {
          setInfoComplete(true)
          return
        }
        const currentLine = lines[lineIndex]
        if (currentLine === '') {
          timeoutId = setTimeout(showDots, 200)
          return
        }
        if (charIndex < currentLine.length) {
          if (currentLine[charIndex] !== ' ') {
            typewriterSoundRef.current?.play()
          }
          setInfoLines(prev => {
            const newLines = [...prev]
            if (!newLines[lineIndex]) newLines[lineIndex] = ''
            newLines[lineIndex] = currentLine.slice(0, charIndex + 1)
            return newLines
          })
          charIndex++
          timeoutId = setTimeout(typeLine, 20)
        } else {
          if (lineIndex < lines.length - 1) {
            timeoutId = setTimeout(showDots, 300)
          } else {
            setInfoComplete(true)
          }
        }
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (!isCancelled) {
          setCurrentLineIndex(0)
          typeLine()
        }
      }, 500)

      const cancelAnimation = () => {
        isCancelled = true
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      window.__cancelInfoAnimation = cancelAnimation

      return () => {
        cancelAnimation()
        delete window.__cancelInfoAnimation
      }
    } else {
      setInfoLines([])
      setCurrentLineIndex(0)
      setDots('')
      setInfoComplete(false)
    }
  }, [showInfo])

  const formatDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/1994`
  }

  if (showAbout) {
    return (
      <div 
        className="home" 
        style={{
          fontFamily: "'PxPlus IBM VGA8', monospace",
          color: '#00CC55',
          background: '#020403',
          cursor: 'pointer',
          minHeight: '100vh'
        }}
        onClick={completeAboutAnimation}
        role="button"
        tabIndex={0}
        aria-label="Toque ou clique para avançar a animação"
      >
        <div className="terminal-content" style={{
          lineHeight: '1.8',
          fontSize: '14px',
          marginTop: '24px'
        }}>
          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#00CC55',
            fontFamily: "'PxPlus IBM VGA8', monospace",
            minHeight: '200px',
            lineHeight: '1.8'
          }}>
            {aboutLines.map((line, index) => (
              <div key={index} style={{ 
                marginBottom: line === '' ? '12px' : '4px',
                minHeight: line === '' ? '12px' : 'auto'
              }}>
                {line}
                {index === currentLineIndex && !aboutComplete && !dots && (
                  <span className="cursor-blink" style={{
                    color: '#00FF66',
                    animation: 'blink 1s step-end infinite',
                    marginLeft: '2px'
                  }}>█</span>
                )}
              </div>
            ))}
            {dots && (
              <span style={{ color: '#00CC55' }}>{dots}</span>
            )}
            {aboutComplete && (
              <button 
                className="terminal-button" 
                onClick={() => setShowAbout(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00FF66',
                  fontFamily: "'PxPlus IBM VGA8', monospace",
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '8px 0',
                  margin: '24px 0 8px 0',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.target.style.color = '#00FF66'}
                onMouseLeave={(e) => e.target.style.color = '#00CC55'}
              >
                &gt; VOLTAR
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (showInfo) {
    return (
      <div 
        className={`home ${crtGlitch ? 'crt-glitch' : ''} ${crtFlicker ? 'crt-flicker' : ''}`}
        style={{
          fontFamily: "'PxPlus IBM VGA8', monospace",
          color: '#00CC55',
          background: '#020403',
          cursor: 'pointer',
          minHeight: '100vh'
        }}
        onClick={completeInfoAnimation}
        role="button"
        tabIndex={0}
        aria-label="Toque ou clique para avançar a animação"
      >
        <div className="terminal-content" style={{
          lineHeight: '1.8',
          fontSize: '14px',
          marginTop: '24px'
        }}>
          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#00CC55',
            fontFamily: "'PxPlus IBM VGA8', monospace",
            minHeight: '200px',
            lineHeight: '1.8'
          }}>
            {infoLines.map((line, index) => (
              <div key={index} style={{ 
                marginBottom: line === '' ? '12px' : '4px',
                minHeight: line === '' ? '12px' : 'auto'
              }}>
                {line}
                {index === currentLineIndex && !infoComplete && !dots && (
                  <span className="cursor-blink" style={{
                    color: '#00FF66',
                    animation: 'blink 1s step-end infinite',
                    marginLeft: '2px'
                  }}>█</span>
                )}
              </div>
            ))}
            {dots && (
              <span style={{ color: '#00CC55' }}>{dots}</span>
            )}
            {infoComplete && (
              <button 
                className="terminal-button" 
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00FF66',
                  fontFamily: "'PxPlus IBM VGA8', monospace",
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '8px 0',
                  margin: '24px 0 8px 0',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.target.style.color = '#00FF66'}
                onMouseLeave={(e) => e.target.style.color = '#00CC55'}
              >
                &gt; VOLTAR
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '4px'
                }}>█</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const dosFiles = [
    { name: 'INICIAR.EXE', action: 'start' },
    { name: 'ARQUIVO.TXT', action: 'about' },
    { name: 'INFO.TXT', action: 'info' },
  ]
  if (onShowStats) dosFiles.push({ name: 'STATS.EXE', action: 'stats' })
  const dosFolders = ['CASOS', 'DOSSIE', 'SETTINGS']

  const handleFileAction = (action) => {
    if (action === 'start') setShowMissionPreview(true)
    else if (action === 'about') setShowAbout(true)
    else if (action === 'info') setShowInfo(true)
    else if (action === 'stats') onShowStats?.()
  }

  const handleAcceptMission = () => {
    onAcceptMission?.(x7ActiveRef.current || chk() ? { x: 1 } : undefined)
  }

  const handleRefuseMission = () => {
    setShowMissionPreview(false)
  }

  return (
    <div 
      className={`home home-dos ${crtGlitch ? 'crt-glitch' : ''} ${crtFlicker ? 'crt-flicker' : ''}`}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: '#020403',
        transform: crtDistortion > 0 ? `translateX(${Math.sin(Date.now() / 10) * crtDistortion}px)` : 'none',
        transition: crtDistortion > 0 ? 'none' : 'transform 0.1s ease-out'
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
            {dosFiles.map((f, i) => (
              <button
                key={f.name}
                className={`dos-file-item ${selectedButton === i ? 'dos-file-selected' : ''}`}
                onClick={() => handleFileAction(f.action)}
                onMouseEnter={() => setSelectedButton(i)}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="dos-folder-sep" />
          <div className="dos-folder-list">
            {dosFolders.map((folder) => (
              <div key={folder} className="dos-folder-item">
                {folder} &gt;FOLDER&lt;
              </div>
            ))}
          </div>
        </div>

        {/* Painel direito - NEXO TERMINAL ou Missão e descrição */}
        <div className="dos-panel dos-panel-right dos-hero-panel">
          {showMissionPreview && crime ? (
            <div className="dos-mission-content">
              <div className="dos-mission-title">MISSÃO</div>
              <div className="dos-mission-case">
                CASO #{crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · {crime.type || 'CRIME'}
              </div>
              <div className="dos-mission-description">
                {(Array.isArray(crime.description)
                  ? crime.description
                  : typeof crime.description === 'string'
                    ? crime.description.split('\n')
                    : crime.description && typeof crime.description === 'object'
                      ? Object.values(crime.description)
                      : []
                ).map((line, i) => (
                  <div key={i}>{typeof line === 'string' ? line : String(line ?? '')}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dos-hero-content">
              <div className="dos-hero-line dos-hero-line-1">NEXO</div>
              <div className="dos-hero-line dos-hero-line-2">TERMINAL</div>
              <div className="dos-hero-subtitle dos-hero-subtitle-2">Full Version of Nexo Terminal</div>
              <div className="dos-hero-subtitle dos-hero-subtitle-3">Released 1987 · Intelligence Division</div>
            </div>
          )}
        </div>
      </div>

      {/* Barra inferior - prompt C:\ e versão, ou Aceitar/Recusar */}
      <div className="dos-bottom-bar">
        {showMissionPreview ? (
          <div className="dos-mission-buttons">
            <button
              className={`dos-mission-btn ${missionButtonSelected === 0 ? 'dos-file-selected' : ''}`}
              onClick={handleAcceptMission}
              onMouseEnter={() => setMissionButtonSelected(0)}
            >
              ACEITAR
            </button>
            <button
              className={`dos-mission-btn ${missionButtonSelected === 1 ? 'dos-file-selected' : ''}`}
              onClick={handleRefuseMission}
              onMouseEnter={() => setMissionButtonSelected(1)}
            >
              RECUSAR
            </button>
          </div>
        ) : (
        <div className="dos-prompt">
          {isCommandLineMode && titleAnimationComplete ? (
            isMobileLandscape ? (
              <>
                C:\&gt;
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => {
                    const v = e.target.value
                    prevCommandRef.current = v
                    setCommandInput(v)
                    bufRef.current = [...bufRef.current.slice(-15), ...v.slice(-1)].slice(-8)
                  }}
                  onKeyDown={(e) => {
                    if (e.key?.length === 1) bufRef.current = [...bufRef.current.slice(-15), e.key].slice(-8)
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const cmd = commandInput.trim().toUpperCase()
                      if (cmd === 'INICIAR' || cmd === 'INICIAR.EXE') setShowMissionPreview(true)
                      else if (cmd === 'ARQUIVO' || cmd === 'ARQUIVO.TXT') setShowAbout(true)
                      else if (cmd === 'INFO' || cmd === 'INFO.TXT') setShowInfo(true)
                      else if (cmd === '#*NEXO77') x7ActiveRef.current = true
                      else if (onShowStats && (cmd === 'STATS' || cmd === (typeof atob !== 'undefined' ? atob('c3RhdHM3Nw==') : 'stats77'))) onShowStats()
                      prevCommandRef.current = ''
                      setCommandInput('')
                    }
                  }}
                  className="dos-prompt-input"
                  placeholder=""
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                <span className="cursor-blink">█</span>
              </>
            ) : (
              <>
                C:\&gt;{commandInput.toUpperCase()}
                <span className="cursor-blink">█</span>
              </>
            )
          ) : (
            <>
              C:\&gt;
              {!titleAnimationComplete ? (
                <span className="dos-boot-text">
                  {displayedText}
                  {showCursor && <span className="cursor-blink">█</span>}
                </span>
              ) : null}
            </>
          )}
        </div>
        )}
        <div className="dos-version">Nexo-piOS-u1.0.01p</div>
      </div>

    </div>
  )
}

export default Home
