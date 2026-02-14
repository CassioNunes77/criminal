import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import './Dossier.css'

function Dossier({ crime, onBack }) {
  const [dossierLines, setDossierLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [dossierComplete, setDossierComplete] = useState(false)
  const typewriterSoundRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const caseNumber = crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')
  const titleLine = (crime.description && crime.description[0]) || `CASO #${caseNumber} - ${crime.type || 'CRIME'} EM ${crime.location || ''}`
  const dateStr = crime.date || (() => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  })()

  useEffect(() => {
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    setDossierLines([])
    setCurrentLineIndex(0)
    setDots('')
    setDossierComplete(false)

    const raw = crime.dossier || ''
    const lines = typeof raw === 'string' ? raw.split('\n') : []

    let lineIndex = 0
    let charIndex = 0
    let dotsCount = 0
    let timeoutId = null
    let isCancelled = false

    const showDots = () => {
      if (isCancelled || dossierComplete) return
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
          setDossierComplete(true)
        }
      }
    }

    const typeLine = () => {
      if (isCancelled || dossierComplete) return
      if (lineIndex >= lines.length) {
        setDossierComplete(true)
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
        setDossierLines(prev => {
          const newLines = [...prev]
          if (!newLines[lineIndex]) newLines[lineIndex] = ''
          newLines[lineIndex] = currentLine.slice(0, charIndex + 1)
          return newLines
        })
        charIndex++
        timeoutId = setTimeout(typeLine, 15)
      } else {
        if (lineIndex < lines.length - 1) {
          timeoutId = setTimeout(showDots, 200)
        } else {
          setDossierComplete(true)
        }
      }
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (!isCancelled) {
        if (lines.length === 0) {
          setDossierComplete(true)
        } else {
          setCurrentLineIndex(0)
          typeLine()
        }
      }
    }, 500)

    const cancelAnimation = () => {
      isCancelled = true
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (timeoutId) clearTimeout(timeoutId)
    }

    return () => {
      cancelAnimation()
    }
  }, [crime])

  const completeAnimation = () => {
    const raw = crime.dossier || ''
    const lines = typeof raw === 'string' ? raw.split('\n') : []
    setDossierLines(lines)
    setDossierComplete(true)
  }

  const handleClick = () => {
    if (!dossierComplete) completeAnimation()
  }

  return (
    <div
      className="dossier-screen"
      onClick={handleClick}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: '#020403',
        cursor: !dossierComplete ? 'pointer' : 'default',
        minHeight: '100vh',
        touchAction: 'manipulation'
      }}
    >
      <div className="terminal-header">
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
        <div className="title" style={{ color: '#00FF66' }}>
          DOSSIER DO CASO
        </div>
        <div className="separator separator-full-width">{'═'.repeat(150)}</div>
      </div>

      <div className="dossier-meta">
        <div className="dossier-meta-item">CASO #{caseNumber}</div>
        <div className="dossier-meta-item">{titleLine}</div>
        <div className="dossier-meta-item">DATA: {dateStr}</div>
      </div>

      <div className="separator">------------------------------------</div>

      <div
        className="dossier-content"
        onClick={!dossierComplete ? completeAnimation : undefined}
        style={{
          lineHeight: '1.8',
          fontSize: '14px',
          marginTop: '20px',
          cursor: !dossierComplete ? 'pointer' : 'default',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          minHeight: '200px'
        }}
      >
        {dossierLines.length > 0 ? (
          dossierLines.map((line, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {line}
              {index === currentLineIndex && !dossierComplete && !dots && (
                <span className="cursor-blink" style={{
                  color: '#00FF66',
                  animation: 'blink 1s step-end infinite',
                  marginLeft: '2px'
                }}>█</span>
              )}
            </div>
          ))
        ) : (
          <div className="dossier-empty">
            Dossier nao disponivel para este caso.
          </div>
        )}
        {dots && <span style={{ color: '#00CC55' }}>{dots}</span>}

        {dossierComplete && (
          <>
            <div className="separator" style={{ margin: '24px 0 12px 0' }}>------------------------------------</div>
            <button
              className="terminal-button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#00FF66',
                fontFamily: "'PxPlus IBM VGA8', monospace",
                fontSize: '16px',
                cursor: 'pointer',
                padding: '8px 0',
                textAlign: 'left',
                width: '100%'
              }}
            >
              &gt; VOLTAR AO RESULTADO
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Dossier
