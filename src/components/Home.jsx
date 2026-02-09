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
    return today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '1994'
    })
  }

  return (
    <div className="home">
      <div className="terminal-header">
        <div className="separator">====================================</div>
        <div className="title terminal-text">
          {displayedText}
          {showCursor && <span className="cursor-blink">█</span>}
        </div>
        <div className="separator">====================================</div>
      </div>

      <div className="terminal-content">
        <div className="status-line">
          DATA: {formatDate()}
        </div>
        <div className="status-line">
          STATUS: <span className="highlight">ONLINE</span>
        </div>

        <div className="separator">------------------------------------</div>

        <div className="crime-header">
          CRIME DO DIA #{String(crime.id).slice(-3)}
        </div>
        <div className="separator">------------------------------------</div>

        <div className="crime-info">
          <div className="crime-type">{crime.type} - {crime.location}</div>
          <div className="crime-time">HORARIO: {crime.time}</div>
        </div>

        <div className="separator">------------------------------------</div>

        <button className="terminal-button" onClick={onStart}>
          &gt; INICIAR INVESTIGACAO
        </button>

        <div className="separator">------------------------------------</div>

        <div className="stats">
          <div className="stat-line">
            SEQUENCIA ATUAL: {streak} {streak === 1 ? 'DIA' : 'DIAS'}
          </div>
          <div className="stat-line">
            RANK GLOBAL: TOP 18%
          </div>
        </div>

        <div className="separator">------------------------------------</div>

        <div className="menu">
          <button className="terminal-button secondary">
            &gt; CASOS ANTERIORES
          </button>
          <button className="terminal-button secondary">
            &gt; ESTATISTICAS
          </button>
          <button className="terminal-button secondary">
            &gt; PERFIL
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
