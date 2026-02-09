import { useState, useEffect } from 'react'
import './Home.css'

function Home({ crime, streak, onStart }) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

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

  const formatDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/1994`
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
          DATA: {formatDate()}
        </div>
        <div className="status-line" style={{
          fontSize: '14px',
          margin: '8px 0',
          color: '#00CC55'
        }}>
          STATUS: <span style={{ color: '#00FF66' }}>ONLINE</span>
        </div>

        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          textAlign: 'center'
        }}>------------------------------------</div>

        <div className="crime-header" style={{
          fontSize: '18px',
          fontWeight: '600',
          textAlign: 'center',
          margin: '16px 0',
          color: '#00FF66'
        }}>
          CRIME DO DIA #{String(crime.id).slice(-3)}
        </div>
        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          textAlign: 'center'
        }}>------------------------------------</div>

        <div className="crime-info" style={{
          margin: '16px 0',
          textAlign: 'center'
        }}>
          <div className="crime-type" style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#00FF66'
          }}>{crime.type} - {crime.location}</div>
          <div className="crime-time" style={{
            fontSize: '14px',
            color: '#00CC55'
          }}>HORARIO: {crime.time}</div>
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

        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          textAlign: 'center'
        }}>------------------------------------</div>

        <div className="stats" style={{
          margin: '16px 0'
        }}>
          <div className="stat-line" style={{
            fontSize: '14px',
            margin: '6px 0',
            color: '#00CC55'
          }}>
            SEQUENCIA ATUAL: {streak} {streak === 1 ? 'DIA' : 'DIAS'}
          </div>
          <div className="stat-line" style={{
            fontSize: '14px',
            margin: '6px 0',
            color: '#00CC55'
          }}>
            RANK GLOBAL: TOP 18%
          </div>
        </div>

        <div className="separator" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0',
          textAlign: 'center'
        }}>------------------------------------</div>

        <div className="menu" style={{
          marginTop: '16px'
        }}>
          <button 
            className="terminal-button secondary"
            style={{
              background: 'none',
              border: 'none',
              color: '#007A33',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px',
              cursor: 'pointer',
              padding: '6px 0',
              margin: '8px 0',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#00CC55'}
            onMouseLeave={(e) => e.target.style.color = '#007A33'}
          >
            &gt; CASOS ANTERIORES
          </button>
          <button 
            className="terminal-button secondary"
            style={{
              background: 'none',
              border: 'none',
              color: '#007A33',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px',
              cursor: 'pointer',
              padding: '6px 0',
              margin: '8px 0',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#00CC55'}
            onMouseLeave={(e) => e.target.style.color = '#007A33'}
          >
            &gt; ESTATISTICAS
          </button>
          <button 
            className="terminal-button secondary"
            style={{
              background: 'none',
              border: 'none',
              color: '#007A33',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px',
              cursor: 'pointer',
              padding: '6px 0',
              margin: '8px 0',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#00CC55'}
            onMouseLeave={(e) => e.target.style.color = '#007A33'}
          >
            &gt; PERFIL
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
