import { useState, useEffect } from 'react'
import './CaseView.css'
import './Home.css'
import './CaseViewDos.css'

/**
 * Mesmo fluxo visual que CaseView (CASO.EXE): painel esquerdo VOLTAR + pastas,
 * painel direito com o conteúdo (banco de dados dos suspeitos).
 */
function SuspectsView({ crime, suspectsWithRecords, fullDosMain = false, onBack }) {
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
      if (e.key === 'Enter') {
        e.preventDefault()
        onBack()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onBack()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onBack])

  const dosFiles = [{ name: 'VOLTAR.EXE', action: 'back' }]
  const dosFolders = ['CASOS', 'DOSSIE', 'SETTINGS']

  const handleFileAction = (action) => {
    if (action === 'back') onBack()
  }

  const caseLine = `CASO #${crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · ${crime.type || 'CRIME'} · REGISTRO SUSPEITOS`

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
            {dosFiles.map((f, i) => (
              <button
                key={f.name}
                type="button"
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

        <div className="dos-panel dos-panel-right">
          <div className="dos-mission-content case-view-content suspects-view-dos">
            <div className="dos-mission-title">BANCO DE DADOS DOS SUSPEITOS</div>
            <div className="dos-mission-case">{caseLine}</div>
            <div className="dos-mission-description">
              {suspectsWithRecords.map((suspect, index) => (
                <div key={index} className="suspect-dos-record">
                  <div className="suspect-dos-name">
                    {suspect.displayName || suspect.name}
                    {suspect.cargo && (
                      <span className="suspect-dos-cargo"> ({suspect.cargo})</span>
                    )}
                  </div>
                  <div className="suspect-dos-line">HISTORICO: {suspect.criminalRecord}</div>
                  {suspect.comportamento && (
                    <div className="suspect-dos-line">COMPORTAMENTO: {suspect.comportamento}</div>
                  )}
                  {suspect.caracteristica && (
                    <div className="suspect-dos-line">CARACTERISTICA: {suspect.caracteristica}</div>
                  )}
                  {suspect.veiculo && (
                    <div className="suspect-dos-line">VEICULO: {suspect.veiculo}</div>
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

export default SuspectsView
