import { useState, useEffect } from 'react'
import './Home.css'

function Home({ crime, streak, onStart }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showAbout, setShowAbout] = useState(false)
  const [aboutText, setAboutText] = useState('')
  const [aboutComplete, setAboutComplete] = useState(false)

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
    if (showAbout) {
      const fullText = `SYSTEM BOOT SEQUENCE INITIATED. ARQUIVO DE ACESSO RESTRITO CARREGADO. ANO 1987. Você é um investigador de uma divisão secreta de inteligência policial, especializado em análise de dados e invasão autorizada de sistemas usados por organizações criminosas. Seu trabalho acontece dentro de redes fechadas e bancos de dados sigilosos, onde todos os dias um novo caso chega ao seu terminal contendo registros incompletos e pistas fragmentadas. Não existem testemunhas, apenas padrões, acessos, horários e erros deixados por quem acreditou que nunca seria rastreado. Sua função é cruzar informações, reconstruir eventos e identificar a verdade antes que os dados desapareçam. Cada crime deve ser resolvido usando lógica, observação e interpretação fria dos fatos. Sem ação direta, apenas você, o sistema e a mente por trás do crime. ACESSO CONCEDIDO. AGUARDANDO PRÓXIMO CASO.`
      setAboutText('')
      setAboutComplete(false)
      let index = 0
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setAboutText(fullText.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setAboutComplete(true)
        }
      }, 20)

      return () => clearInterval(interval)
    } else {
      setAboutText('')
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
            margin: '12px 0',
            textAlign: 'center'
          }}>====================================</div>
          <div className="title" style={{
            fontFamily: "'VT323', monospace",
            fontSize: '32px',
            textAlign: 'center',
            padding: '8px 0',
            color: '#00FF66'
          }}>
            SOBRE O GAME
          </div>
          <div className="separator" style={{
            color: '#007A33',
            fontSize: '14px',
            margin: '12px 0',
            textAlign: 'center'
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
            fontFamily: "'IBM Plex Mono', monospace"
          }}>
            {aboutText}
            <span className="cursor-blink" style={{
              color: '#00FF66',
              animation: 'blink 1s step-end infinite',
              marginLeft: '2px'
            }}>█</span>
          </div>

          {aboutComplete && (
            <>
              <div className="separator" style={{
                color: '#007A33',
                fontSize: '14px',
                margin: '24px 0 12px 0',
                textAlign: 'center'
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
            </>
          )}
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
          margin: '12px 0',
          textAlign: 'center'
        }}>====================================</div>
        <div className="title terminal-text" style={{
          fontFamily: "'VT323', monospace",
          fontSize: '32px',
          textAlign: 'center',
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
          textAlign: 'center'
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
          margin: '12px 0',
          textAlign: 'center'
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
