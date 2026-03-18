import { useState, useEffect } from 'react'
import './CaseView.css'
import './Home.css'
import './CaseViewDos.css'

/**
 * Tela dedicada às pistas (mesmo shell que CASO / Suspeitos).
 */
function CluesView({ crime, cluesRevealedTypes, forceRevealType, fullDosMain = false, onBack }) {
  const [selectedButton, setSelectedButton] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === 'undefined') return '00:00'
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    if (fullDosMain) return undefined
    const t = setInterval(() => {
      const d = new Date()
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [fullDosMain])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        onBack()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onBack])

  const revealed = (type) =>
    (cluesRevealedTypes && cluesRevealedTypes.includes(type)) || type === forceRevealType

  const nRev = crime.clues.filter(c => revealed(c.type)).length
  const caseLine = `CASO #${crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · ${crime.type || 'CRIME'} · PISTAS ${nRev}/${crime.clues.length}`

  return (
    <div
      className={fullDosMain ? 'investigation-dos investigation-full-dos-main-root case-view-full-root' : 'home home-dos'}
      style={{
        fontFamily: "'PxPlus IBM VGA8', monospace",
        color: '#00CC55',
        background: fullDosMain ? 'transparent' : '#000'
      }}
    >
      {!fullDosMain && (
        <div className="dos-top-bar">
          <div className="dos-top-line" />
          <div className="dos-clock">{currentTime}</div>
        </div>
      )}

      <div className={fullDosMain ? 'investigation-full-dos-main-row' : 'dos-main'}>
        <div className="dos-panel dos-panel-left">
          <div className="dos-file-list">
            <button
              type="button"
              className={`dos-file-item ${selectedButton === 0 ? 'dos-file-selected' : ''}`}
              onClick={onBack}
              onMouseEnter={() => setSelectedButton(0)}
            >
              VOLTAR.EXE
            </button>
          </div>
          <div className="dos-folder-sep" />
          <div className="dos-folder-list">
            {['CASOS', 'PISTAS', 'DOSSIE'].map((folder) => (
              <div key={folder} className="dos-folder-item">
                {folder} &gt;FOLDER&lt;
              </div>
            ))}
          </div>
        </div>

        <div className="dos-panel dos-panel-right">
          <div className="dos-mission-content case-view-content clues-view-dos">
            <div className="dos-mission-title">REGISTRO DE PISTAS</div>
            <div className="dos-mission-case">{caseLine}</div>
            <div className="dos-mission-description">
              {crime.clues.map((clue) => (
                <div key={clue.type} className="clue-dos-block">
                  <div className="clue-dos-header">[{clue.type}]</div>
                  {revealed(clue.type) ? (
                    <div className="clue-dos-body">{clue.text}</div>
                  ) : (
                    <div className="clue-dos-locked">[ ACESSO NAO LIBERADO — abra o arquivo na pasta PISTAS ]</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CluesView
