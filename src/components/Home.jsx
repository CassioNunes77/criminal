import { useState, useEffect, useRef } from 'react'
import './Home.css'
import { TypewriterSound } from '../utils/typewriterSound'

function Home({ crime, streak, onStart }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [aboutLines, setAboutLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [aboutComplete, setAboutComplete] = useState(false)
  const [selectedButton, setSelectedButton] = useState(0) // 0 = iniciar, 1 = sobre
  const [crtGlitch, setCrtGlitch] = useState(false)
  const [crtFlicker, setCrtFlicker] = useState(false)
  const [crtDistortion, setCrtDistortion] = useState(0)
  const typewriterSoundRef = useRef(null)
  const typingTimeoutRef = useRef(null)

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

  // CRT monitor glitch effects
  useEffect(() => {
    if (showAbout) return // Don't apply glitches on about screen

    const glitchInterval = setInterval(() => {
      // Random glitch (flicker) - happens more frequently
      if (Math.random() < 0.35) { // 35% chance (increased from 15%)
        setCrtGlitch(true)
        setTimeout(() => setCrtGlitch(false), 80 + Math.random() * 150) // Longer duration
      }
    }, 1500 + Math.random() * 2000) // Every 1.5-3.5 seconds (more frequent)

    const flickerInterval = setInterval(() => {
      // More intense flicker - happens more often
      if (Math.random() < 0.5) { // 50% chance (increased from 30%)
        setCrtFlicker(true)
        setTimeout(() => setCrtFlicker(false), 30 + Math.random() * 60) // Longer duration
      }
    }, 800 + Math.random() * 1200) // Every 0.8-2 seconds (more frequent)

    const distortionInterval = setInterval(() => {
      // More frequent horizontal distortion
      if (Math.random() < 0.2) { // 20% chance (increased from 8%)
        setCrtDistortion(2 + Math.random() * 4) // Stronger distortion (increased from 1-3)
        setTimeout(() => setCrtDistortion(0), 150 + Math.random() * 300) // Longer duration
      }
    }, 2000 + Math.random() * 3000) // Every 2-5 seconds (more frequent)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(flickerInterval)
      clearInterval(distortionInterval)
    }
  }, [showAbout])

  // Keyboard navigation for DOS-style menu
  useEffect(() => {
    if (showAbout) return // Don't handle navigation when in about screen

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedButton(prev => (prev + 1) % 2) // Toggle between 0 and 1
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedButton(prev => (prev - 1 + 2) % 2) // Toggle between 0 and 1
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedButton === 0) {
          onStart()
        } else {
          setShowAbout(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showAbout, selectedButton, onStart])

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    // Handle Enter key - skip animation if typing, go back if complete
    const handleKeyPress = (e) => {
      if (showAbout && e.key === 'Enter') {
        if (!aboutComplete) {
          // Skip animation - show all text immediately and cancel all timeouts
          e.preventDefault()
          
          // Cancel animation completely
          if (window.__cancelAboutAnimation) {
            window.__cancelAboutAnimation()
          }
          
          const allLines = [
            'SYSTEM BOOT SEQUENCE INITIATED...',
            'ARQUIVO DE ACESSO RESTRITO CARREGADO....',
            'ANO 1987.',
            '',
            'Você é um investigador de uma divisão secreta de inteligência policial, especializado em análise de dados e invasão autorizada de sistemas usados por organizações criminosas.',
            '',
            'Seu trabalho acontece dentro de redes fechadas e bancos de dados sigilosos, onde todos os dias um novo caso chega ao seu terminal contendo registros incompletos e pistas fragmentadas.',
            '',
            'Não existem testemunhas, apenas padrões, acessos, horários e erros deixados por quem acreditou que nunca seria rastreado.',
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
          setAboutLines(allLines)
          setCurrentLineIndex(allLines.length - 1)
          setDots('')
          setAboutComplete(true)
        } else {
          // Go back to home
          setShowAbout(false)
        }
      }
    }

    if (showAbout) {
      window.addEventListener('keydown', handleKeyPress)
      return () => {
        window.removeEventListener('keydown', handleKeyPress)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [showAbout, aboutComplete])

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
        'Você é um investigador de uma divisão secreta de inteligência policial, especializado em análise de dados e invasão autorizada de sistemas usados por organizações criminosas.',
        '',
        'Seu trabalho acontece dentro de redes fechadas e bancos de dados sigilosos, onde todos os dias um novo caso chega ao seu terminal contendo registros incompletos e pistas fragmentadas.',
        '',
        'Não existem testemunhas, apenas padrões, acessos, horários e erros deixados por quem acreditou que nunca seria rastreado.',
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

  const formatDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/1994`
  }

  if (showAbout) {
    return (
      <div className="home" style={{
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#00CC55',
        background: '#020403'
      }}>
        <div className="terminal-header">
          <div className="separator" style={{
            color: '#007A33',
            fontSize: '14px',
            margin: '12px 0'
          }}>====================================</div>
          <div className="title" style={{
            fontFamily: "'PxPlus IBM VGA8', monospace",
            fontSize: '32px',
            padding: '8px 0',
            color: '#00FF66'
          }}>
            SOBRE
          </div>
          <div className="separator" style={{
            color: '#007A33',
            fontSize: '14px',
            margin: '12px 0'
          }}>====================================</div>
        </div>

        <div className="terminal-content" style={{
          lineHeight: '1.8',
          fontSize: '14px',
          marginTop: '20px'
        }}>
          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#00CC55',
            fontFamily: "'IBM Plex Mono', monospace",
            minHeight: '200px',
            lineHeight: '1.8'
          }}>
            {aboutLines.map((line, index) => {
              const isDosHeaderLine =
                line === 'SYSTEM BOOT SEQUENCE INITIATED...' ||
                line === 'ARQUIVO DE ACESSO RESTRITO CARREGADO....'

              return (
                <div key={index} style={{ 
                  marginBottom: line === '' ? '12px' : '4px',
                  minHeight: line === '' ? '12px' : 'auto',
                  fontFamily: isDosHeaderLine ? "'PxPlus IBM VGA8', monospace" : undefined
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
              )
            })}
            {dots && (
              <span style={{ color: '#00CC55' }}>{dots}</span>
            )}
            {aboutComplete && (
              <>
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '2px'
                }}>█</span>
                
                <div className="separator" style={{
                  color: '#007A33',
                  fontSize: '14px',
                  margin: '24px 0 12px 0'
                }}>------------------------------------</div>

                <button 
                  className="terminal-button" 
                  onClick={() => setShowAbout(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00CC55',
                    fontFamily: "'PxPlus IBM VGA8', monospace",
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '8px 0',
                    margin: '8px 0',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#00FF66'}
                  onMouseLeave={(e) => e.target.style.color = '#00CC55'}
                >
                  &gt; VOLTAR
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`home ${crtGlitch ? 'crt-glitch' : ''} ${crtFlicker ? 'crt-flicker' : ''}`}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: '#020403',
        transform: crtDistortion > 0 ? `translateX(${Math.sin(Date.now() / 10) * crtDistortion}px)` : 'none',
        transition: crtDistortion > 0 ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <div className="terminal-header">
        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          fontFamily: "'PxPlus IBM VGA8', monospace"
        }}>====================================</div>
        <div className="title terminal-text" style={{
          fontFamily: "'PxPlus IBM VGA8', monospace",
          fontSize: '32px',
          padding: '8px 0',
          color: '#00FF66',
          textShadow: '0 0 2px rgba(0, 255, 100, 0.4), 0 0 4px rgba(0, 255, 100, 0.15)'
        }}>
          {displayedText}
          {showCursor && <span className="cursor-blink" style={{
            animation: 'blink 1s step-end infinite'
          }}>█</span>}
        </div>
        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          fontFamily: "'PxPlus IBM VGA8', monospace"
        }}>====================================</div>
      </div>

      <div className="terminal-content" style={{
        lineHeight: '1.6'
      }}>
        <button 
          className="terminal-button" 
          onClick={onStart}
          style={{
            background: 'none',
            border: 'none',
            color: selectedButton === 0 ? '#00FF66' : '#00CC55',
            fontFamily: "'PxPlus IBM VGA8', monospace",
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 0',
            margin: '8px 0',
            textAlign: 'left',
            width: '100%',
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            if (selectedButton !== 0) e.target.style.color = '#00FF66'
            setSelectedButton(0)
          }}
          onMouseLeave={(e) => {
            if (selectedButton !== 0) e.target.style.color = '#00CC55'
          }}
        >
          &gt; INICIAR INVESTIGACAO
          {selectedButton === 0 && titleAnimationComplete && (
            <span className="cursor-blink" style={{
              color: '#00FF66',
              animation: 'blink 1s step-end infinite',
              marginLeft: '4px'
            }}>█</span>
          )}
        </button>

        <button 
          className="terminal-button" 
          onClick={() => setShowAbout(true)}
          style={{
            background: 'none',
            border: 'none',
            color: selectedButton === 1 ? '#00FF66' : '#00CC55',
            fontFamily: "'PxPlus IBM VGA8', monospace",
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 0',
            margin: '8px 0',
            textAlign: 'left',
            width: '100%',
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            if (selectedButton !== 1) e.target.style.color = '#00FF66'
            setSelectedButton(1)
          }}
          onMouseLeave={(e) => {
            if (selectedButton !== 1) e.target.style.color = '#00CC55'
          }}
        >
          &gt; SOBRE
          {selectedButton === 1 && titleAnimationComplete && (
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

export default Home
