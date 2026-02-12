import { useState, useEffect } from 'react'
import './CaseView.css'

function CaseView({ crime, onBack }) {
  const [selectedButton, setSelectedButton] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onBack()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedButton(prev => (prev + 1) % 2)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [onBack])

  return (
    <div className="case-view" style={{
      fontFamily: "'PxPlus IBM VGA8', monospace",
      color: '#00CC55',
      background: '#020403'
    }}>
      <div className="terminal-header">
        <div className="separator separator-full-width" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0'
        }}>{'═'.repeat(150)}</div>
        <div className="title" style={{
          fontFamily: "'PxPlus IBM VGA8', monospace",
          fontSize: '32px',
          padding: '8px 0',
          color: '#00FF66'
        }}>
          CASO
        </div>
        <div className="separator separator-full-width" style={{
          color: '#007A33',
          fontSize: '14px',
          margin: '12px 0'
        }}>{'═'.repeat(150)}</div>
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
          fontFamily: "'PxPlus IBM VGA8', monospace",
          minHeight: '200px',
          lineHeight: '1.8'
        }}>
          {crime.description.map((line, index) => (
            <div key={index} style={{ 
              marginBottom: line === '' ? '12px' : '4px',
              minHeight: line === '' ? '12px' : 'auto'
            }}>
              {line}
            </div>
          ))}
        </div>

        <button 
          className="terminal-button" 
          onClick={onBack}
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
          onMouseEnter={() => setSelectedButton(0)}
        >
          &gt; VOLTAR
          {selectedButton === 0 && (
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

export default CaseView
