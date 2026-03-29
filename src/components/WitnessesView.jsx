import { useState, useEffect } from 'react'
import './CaseView.css'
import './Home.css'
import './CaseViewDos.css'

/**
 * Mesmo shell que SuspectsView / CaseView: painel esquerdo INVESTIGACAO.EXE,
 * painel direito com registro das testemunhas.
 */
function WitnessesView({
  crime,
  witnessesViewed = [],
  onViewWitness,
  fullDosMain = false,
  onBack
}) {
  const [selectedButton, setSelectedButton] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window === 'undefined') return '00:00'
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })

  const witnesses = crime.witnesses || []
  const viewed = new Set(witnessesViewed)

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

  const dosFiles = [{ name: 'INVESTIGACAO.EXE', action: 'back' }]
  const dosFolders = ['CASOS', 'DOSSIE', 'SETTINGS']

  const handleFileAction = (action) => {
    if (action === 'back') onBack()
  }

  const caseLine = `CASO #${crime.caseNumber || String(crime.id).slice(-4).padStart(4, '0')} · ${crime.type || 'CRIME'} · REGISTRO TESTEMUNHAS · ${witnessesViewed.length}/${witnesses.length}`

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
            <div className="dos-mission-title">BANCO DE DADOS DAS TESTEMUNHAS</div>
            <div className="dos-mission-case">{caseLine}</div>
            <div className="dos-mission-description">
              {witnesses.length === 0 && (
                <div className="suspect-dos-line">[ NENHUM REGISTRO DE TESTEMUNHA NESTE CASO ]</div>
              )}
              {witnesses.map((witness, index) => (
                <div key={index} className="suspect-dos-record">
                  <div className="suspect-dos-name">
                    TESTEMUNHA #{String(index + 1).padStart(2, '0')}: {witness.name}
                    {witness.cargo && (
                      <span className="suspect-dos-cargo"> ({witness.cargo})</span>
                    )}
                  </div>
                  {viewed.has(index) ? (
                    <>
                      <div className="suspect-dos-line">DEPOIMENTO: {witness.statement}</div>
                      <div className="suspect-dos-line">
                        AVALIACAO:{' '}
                        {witness.isTruthful
                          ? '[ INFORMACAO VERIFICADA ]'
                          : '[ POSSIVEL INCONSISTENCIA — CRUZAR COM PISTAS ]'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="suspect-dos-line" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        STATUS: [ DEPOIMENTO NAO REGISTRADO ]
                      </div>
                      <button
                        type="button"
                        className="dos-file-item witness-register-depoimento"
                        onClick={() => onViewWitness?.(index)}
                        style={{ marginTop: '8px', textAlign: 'left' }}
                      >
                        VER
                      </button>
                    </>
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

export default WitnessesView
