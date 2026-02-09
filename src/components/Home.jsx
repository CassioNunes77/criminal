import { useState, useEffect, useRef } from 'react'
import './Home.css'
import { TypewriterSound } from '../utils/typewriterSound'

function Home({ crime, streak, onStart }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showAbout, setShowAbout] = useState(false)
  const [aboutLines, setAboutLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [aboutComplete, setAboutComplete] = useState(false)
  const typewriterSoundRef = useRef(null)

  useEffect(() => {
    const text = `NEXO TERMINAL v1.0`
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowCursor(false), 500)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    // Handle Enter key to go back when about is complete
    const handleKeyPress = (e) => {
      if (showAbout && aboutComplete && e.key === 'Enter') {
        setShowAbout(false)
      }
    }

    if (showAbout && aboutComplete) {
      window.addEventListener('keydown', handleKeyPress)
      return () => {
        window.removeEventListener('keydown', handleKeyPress)
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

      const showDots = () => {
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

      timeoutId = setTimeout(() => {
        setCurrentLineIndex(0)
        typeLine()
      }, 500)

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
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
            fontFamily: "'VT323', monospace",
            fontSize: '32px',
            padding: '8px 0',
            color: '#00FF66'
          }}>
            SOBRE O GAME
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
        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0'
        }}>------------------------------------</div>

          <button 
            className="terminal-button" 
            onClick={() => setShowAbout(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00CC55',
              fontFamily: "'IBM Plex Mono', monospace",
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

        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0'
        }}>------------------------------------</div>

          <div style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#00CC55',
            fontFamily: "'IBM Plex Mono', monospace",
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
              <span className="cursor-blink" style={{
                color: '#00FF66',
                animation: 'blink 1s step-end infinite',
                marginLeft: '2px'
              }}>█</span>
            )}
          </div>
        </div>
      </div>
    )
  }

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
        <div className="title terminal-text" style={{
          fontFamily: "'VT323', monospace",
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
          margin: '12px 0'
        }}>====================================</div>
      </div>

      <div className="terminal-content" style={{
        lineHeight: '1.6'
      }}>
        <div className="status-line" style={{
          fontSize: '14px',
          margin: '8px 0',
          color: '#00CC55'
        }}>
          CARREGANDO...
        </div>

        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0'
        }}>------------------------------------</div>

        <button 
          className="terminal-button" 
          onClick={onStart}
          style={{
            background: 'none',
            border: 'none',
            color: '#00CC55',
            fontFamily: "'IBM Plex Mono', monospace",
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
          &gt; INICIAR INVESTIGACAO
        </button>

        <button 
          className="terminal-button" 
          onClick={() => setShowAbout(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00CC55',
            fontFamily: "'IBM Plex Mono', monospace",
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
          &gt; SOBRE O GAME
        </button>
      </div>
    </div>
  )
}

export default Home
