import { useState, useEffect, useRef } from 'react'
import { TypewriterSound } from '../utils/typewriterSound'
import './CaseDescription.css'

function CaseDescription({ crime, onAccept, onBack }) {
  const [descriptionLines, setDescriptionLines] = useState([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [descriptionComplete, setDescriptionComplete] = useState(false)
  const [selectedButton, setSelectedButton] = useState(0) // 0 = aceitar, 1 = recusar
  const typewriterSoundRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize typewriter sound
    if (!typewriterSoundRef.current) {
      typewriterSoundRef.current = new TypewriterSound()
      typewriterSoundRef.current.init()
    }

    // Handle keyboard navigation
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!descriptionComplete) {
          // Cancel animation completely and show all text
          if (window.__cancelCaseAnimation) {
            window.__cancelCaseAnimation()
          }
          
          // Show all text immediately
          const allLines = crime.description || []
          setDescriptionLines(allLines)
          setCurrentLineIndex(allLines.length - 1)
          setDots('')
          setDescriptionComplete(true)
          setSelectedButton(0) // Select accept button by default
        } else if (descriptionComplete) {
          // Activate selected button
          if (selectedButton === 0) {
            onAccept()
          } else {
            onBack()
          }
        }
      } else if (descriptionComplete && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault()
        if (e.key === 'ArrowDown') {
          setSelectedButton(prev => (prev + 1) % 2) // Move down: 0 -> 1, 1 -> 0
        } else if (e.key === 'ArrowUp') {
          setSelectedButton(prev => (prev - 1 + 2) % 2) // Move up: 1 -> 0, 0 -> 1
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
            setSelectedButton(0) // Auto-select accept button when animation completes
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
              <div className="separator" style={{
                color: '#007A33',
                fontSize: '14px',
                margin: '24px 0 12px 0'
              }}>------------------------------------</div>

              <button 
                className="terminal-button" 
                onClick={onAccept}
                onMouseEnter={() => setSelectedButton(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: selectedButton === 0 ? '#00FF66' : '#00CC55',
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
                {selectedButton === 0 && (
                  <span className="cursor-blink" style={{
                    color: '#00FF66',
                    animation: 'blink 1s step-end infinite',
                    marginLeft: '4px'
                  }}>█</span>
                )}
              </button>

              <button 
                className="terminal-button" 
                onClick={onBack}
                onMouseEnter={() => setSelectedButton(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: selectedButton === 1 ? '#00FF66' : '#00CC55',
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
                &gt; RECUSAR
                {selectedButton === 1 && (
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
