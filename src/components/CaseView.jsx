import { useState, useEffect } from 'react'
import './CaseView.css'
import './Home.css'
import './CaseViewDos.css'

function CaseView({ crime, onBack }) {
  const [selectedButton, setSelectedButton] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === 'undefined') return '00:00'
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

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

  const dosFiles = [
    { name: 'VOLTAR.EXE', action: 'back' },
  ]
  const dosFolders = ['CASOS', 'DOSSIE', 'SETTINGS']

  const handleFileAction = (action) => {
    if (action === 'back') {
      onBack()
    }
  }

  return (
    <div 
      className="home home-dos"
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: '#000'
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

        {/* Painel direito - CASO */}
        <div className="dos-panel dos-panel-right">
          <div className="dos-mission-content case-view-content">
            <div className="dos-mission-title">CASO</div>
            <div className="dos-mission-case">
              CASO #{crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · {crime.type || 'CRIME'}
            </div>
            <div className="dos-mission-description">
              {crime.description.map((line, index) => (
                <div key={index}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior - VOLTAR */}
      <div className="dos-bottom-bar">
        <button
          className="dos-mission-btn dos-file-selected"
          onClick={onBack}
          onMouseEnter={() => setSelectedButton(0)}
        >
          VOLTAR
        </button>
        <div className="dos-version">
          NEXO TERMINAL v1.0
        </div>
      </div>
    </div>
  )
}

export default CaseView
