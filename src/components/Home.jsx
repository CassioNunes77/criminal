import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [missionLines, setMissionLines] = useState([])
  const [missionCurrentLineIndex, setMissionCurrentLineIndex] = useState(0)
  const [missionDots, setMissionDots] = useState('')
  const [missionComplete, setMissionComplete] = useState(false)
  const missionTypingTimeoutRef = useRef(null)
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

  const completeMissionAnimation = useCallback(() => {
    if (window.__cancelMissionAnimation) window.__cancelMissionAnimation()
    const raw = crime?.description
    const lines = Array.isArray(raw)
      ? raw.map(l => (typeof l === 'string' ? l : String(l ?? '')))
      : typeof raw === 'string'
        ? raw.split('\n')
        : raw && typeof raw === 'object'
          ? Object.values(raw).map(v => (typeof v === 'string' ? v : String(v ?? '')))
          : []
    setMissionLines(lines)
    setMissionCurrentLineIndex(Math.max(0, lines.length - 1))
    setMissionDots('')
    setMissionComplete(true)
  }, [crime])

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

  // Keyboard: desktop = command-line mode, mobile = arrow keys, mission = Aceitar/Recusar, about/info = completar ou VOLTAR
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ARQUIVO ou INFO: Enter completa animação ou volta
      if (showAbout || showInfo) {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (showAbout && !aboutComplete) completeAboutAnimation()
          else if (showInfo && !infoComplete) completeInfoAnimation()
          else { setShowAbout(false); setShowInfo(false) }
        }
        return
      }

      // Quando em preview de missão: completar animação ou Aceitar/Recusar
      if (showMissionPreview) {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (!missionComplete) {
            completeMissionAnimation()
          } else if (missionButtonSelected === 0) {
            onAcceptMission?.(x7ActiveRef.current || chk() ? { x: 1 } : undefined)
          } else {
            setShowMissionPreview(false)
          }
        } else if (missionComplete && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault()
          setMissionButtonSelected(prev => (prev + 1) % 2)
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
  }, [showAbout, showInfo, aboutComplete, infoComplete, showMissionPreview, missionComplete, missionButtonSelected, selectedButton, completeMissionAnimation, onAcceptMission, onShowStats, isCommandLineMode, isMobileLandscape, commandInput])

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

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Efeito typewriter na missão
  useEffect(() => {
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    if (showMissionPreview && crime) {
      setMissionLines([])
      setMissionCurrentLineIndex(0)
      setMissionDots('')
      setMissionComplete(false)

      const raw = crime.description
      const lines = Array.isArray(raw)
        ? raw.map(l => (typeof l === 'string' ? l : String(l ?? '')))
        : typeof raw === 'string'
          ? raw.split('\n')
          : raw && typeof raw === 'object'
            ? Object.values(raw).map(v => (typeof v === 'string' ? v : String(v ?? '')))
            : []

      let lineIndex = 0
      let charIndex = 0
      let dotsCount = 0
      let timeoutId = null
      let isCancelled = false

      const showDots = () => {
        if (isCancelled || missionComplete) return
        if (dotsCount < 3) {
          setMissionDots('.'.repeat(dotsCount + 1))
          dotsCount++
          timeoutId = setTimeout(showDots, 300)
        } else {
          setMissionDots('')
          dotsCount = 0
          lineIndex++
          if (lineIndex < lines.length) {
            setMissionCurrentLineIndex(lineIndex)
            charIndex = 0
            timeoutId = setTimeout(typeLine, 50)
          } else {
            setMissionComplete(true)
          }
        }
      }

      const typeLine = () => {
        if (isCancelled || missionComplete) return
        if (lineIndex >= lines.length) {
          setMissionComplete(true)
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
          setMissionLines(prev => {
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
            setMissionComplete(true)
          }
        }
      }

      missionTypingTimeoutRef.current = setTimeout(() => {
        if (!isCancelled) typeLine()
      }, 500)

      const cancelAnimation = () => {
        isCancelled = true
        if (missionTypingTimeoutRef.current) {
          clearTimeout(missionTypingTimeoutRef.current)
          missionTypingTimeoutRef.current = null
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      window.__cancelMissionAnimation = cancelAnimation

      return () => {
        cancelAnimation()
        delete window.__cancelMissionAnimation
      }
    } else {
      setMissionLines([])
      setMissionCurrentLineIndex(0)
      setMissionDots('')
      setMissionComplete(false)
    }
  }, [showMissionPreview, crime])

  const dosFiles = [
    { name: 'INICIAR.EXE', action: 'start' },
    { name: 'ARQUIVO.TXT', action: 'about' },
    { name: 'INFO.TXT', action: 'info' },
  ]
  if (onShowStats) dosFiles.push({ name: 'STATS.EXE', action: 'stats' })
  const dosFolders = ['CASOS', 'DOSSIE', 'SETTINGS']

  const handleFileAction = (action) => {
    if (action === 'start') {
      setShowMissionPreview(true)
      setShowAbout(false)
      setShowInfo(false)
    } else if (action === 'about') {
      setShowAbout(true)
      setShowInfo(false)
      setShowMissionPreview(false)
    } else if (action === 'info') {
      setShowInfo(true)
      setShowAbout(false)
      setShowMissionPreview(false)
    } else if (action === 'stats') onShowStats?.()
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

        {/* Painel direito - NEXO TERMINAL, Missão, ARQUIVO ou INFO */}
        <div className="dos-panel dos-panel-right dos-hero-panel">
          {showAbout ? (
            <div
              className="dos-mission-content"
              onClick={!aboutComplete ? completeAboutAnimation : undefined}
              onTouchStart={!aboutComplete ? (e) => { e.preventDefault(); completeAboutAnimation() } : undefined}
              style={{ cursor: !aboutComplete ? 'pointer' : 'default', touchAction: 'manipulation' }}
            >
              <div className="dos-mission-title">ARQUIVO</div>
              <div className="dos-mission-description">
                {aboutLines.map((line, index) => (
                  <div key={index}>
                    {line}
                    {index === currentLineIndex && !aboutComplete && !dots && (
                      <span className="cursor-blink" style={{ color: '#00FF66', marginLeft: '2px' }}>█</span>
                    )}
                  </div>
                ))}
                {dots && <span style={{ color: '#00CC55' }}>{dots}</span>}
              </div>
            </div>
          ) : showInfo ? (
            <div
              className="dos-mission-content"
              onClick={!infoComplete ? completeInfoAnimation : undefined}
              onTouchStart={!infoComplete ? (e) => { e.preventDefault(); completeInfoAnimation() } : undefined}
              style={{ cursor: !infoComplete ? 'pointer' : 'default', touchAction: 'manipulation' }}
            >
              <div className="dos-mission-title">INFO</div>
              <div className="dos-mission-description">
                {infoLines.map((line, index) => (
                  <div key={index}>
                    {line}
                    {index === currentLineIndex && !infoComplete && !dots && (
                      <span className="cursor-blink" style={{ color: '#00FF66', marginLeft: '2px' }}>█</span>
                    )}
                  </div>
                ))}
                {dots && <span style={{ color: '#00CC55' }}>{dots}</span>}
              </div>
            </div>
          ) : showMissionPreview && crime ? (
            <div
              className="dos-mission-content"
              onClick={!missionComplete ? completeMissionAnimation : undefined}
              onTouchStart={!missionComplete ? (e) => { e.preventDefault(); completeMissionAnimation() } : undefined}
              style={{ cursor: !missionComplete ? 'pointer' : 'default', touchAction: 'manipulation' }}
            >
              <div className="dos-mission-title">MISSÃO</div>
              <div className="dos-mission-case">
                CASO #{crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · {crime.type || 'CRIME'}
              </div>
              <div className="dos-mission-description">
                {missionLines.map((line, i) => (
                  <div key={i}>
                    {line}
                    {i === missionCurrentLineIndex && !missionComplete && !missionDots && (
                      <span className="cursor-blink" style={{ color: '#00FF66', marginLeft: '2px' }}>█</span>
                    )}
                  </div>
                ))}
                {missionDots && <span style={{ color: '#00CC55' }}>{missionDots}</span>}
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

      {/* Barra inferior - prompt C:\ e versão, Aceitar/Recusar, ou VOLTAR */}
      <div className="dos-bottom-bar">
        {showAbout || showInfo ? (
          <button
            className="dos-mission-btn dos-file-selected"
            onClick={() => { setShowAbout(false); setShowInfo(false) }}
          >
            VOLTAR
          </button>
        ) : showMissionPreview ? (
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
