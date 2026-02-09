import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import './CaseDescription.css'

function CaseDescription({ crime, onAccept }) {
  const [descriptionLines, setDescriptionLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [descriptionComplete, setDescriptionComplete] = useState(false)
  const [buttonSelected, setButtonSelected] = useState(false)
  const typewriterSoundRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    // Handle Enter key - skip animation if typing, accept mission if complete
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (!descriptionComplete) {
          e.preventDefault()
          
          // Cancel animation completely
          if (window.__cancelCaseAnimation) {
            window.__cancelCaseAnimation()
          }
          
          // Show all text immediately
          const allLines = crime.description || []
          setDescriptionLines(allLines)
          setCurrentLineIndex(allLines.length - 1)
          setDots('')
          setDescriptionComplete(true)
          setButtonSelected(true)
        } else if (descriptionComplete && buttonSelected) {
          e.preventDefault()
          onAccept()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    setDescriptionLines([])
    setCurrentLineIndex(0)
    setDots('')
    setDescriptionComplete(false)

    const lines = crime.description || []

    let lineIndex = 0
    let charIndex = 0
    let dotsCount = 0
    let timeoutId = null
    let isCancelled = false

      const showDots = () => {
        if (isCancelled || descriptionComplete) return
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
            setDescriptionComplete(true)
          }
        }
      }

      const typeLine = () => {
        if (isCancelled || descriptionComplete) return
        if (lineIndex >= lines.length) {
          setDescriptionComplete(true)
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
          
          setDescriptionLines(prev => {
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
            setDescriptionComplete(true)
            setButtonSelected(true) // Auto-select button when animation completes
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
      window.__cancelCaseAnimation = cancelAnimation

      // Auto-select button when description completes
      if (descriptionComplete) {
        setButtonSelected(true)
      }

      return () => {
        window.removeEventListener('keydown', handleKeyPress)
        cancelAnimation()
        delete window.__cancelCaseAnimation
      }
  }, [crime])

  return (
    <div className="case-description" style={{
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
          NOVA MISSÃO
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
          {descriptionLines.map((line, index) => (
            <div key={index} style={{ 
              marginBottom: line === '' ? '12px' : '4px',
              minHeight: line === '' ? '12px' : 'auto'
            }}>
              {line}
              {index === currentLineIndex && !descriptionComplete && !dots && (
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
          {descriptionComplete && (
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
                onClick={onAccept}
                onMouseEnter={() => setButtonSelected(true)}
                onMouseLeave={() => setButtonSelected(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: buttonSelected ? '#00FF66' : '#00CC55',
                  fontFamily: "'IBM Plex Mono', monospace",
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
              >
                &gt; ACEITAR MISSÃO
                {buttonSelected && (
                  <span className="cursor-blink" style={{
                    color: '#00FF66',
                    animation: 'blink 1s step-end infinite',
                    marginLeft: '4px'
                  }}>█</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseDescription
