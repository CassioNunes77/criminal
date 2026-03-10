import { useState, useEffect } from 'react'
import { fetchGameStats } from '../utils/gameStatsService'
import { getDailyStats } from '../utils/statsUtils'
import './Stats.css'

function Stats({ onBack }) {
  const [firebaseStats, setFirebaseStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const localStats = getDailyStats()

  useEffect(() => {
    fetchGameStats().then((data) => {
      setFirebaseStats(data)
      setLoading(false)
    })
  }, [])

  const summary = firebaseStats?.summary ?? { totalPlayed: 0, totalSolved: 0, totalFailed: 0 }
  const byDay = firebaseStats?.byDay ?? []

  return (
    <div className="stats-screen">
      <div className="stats-header">
        <h2 className="stats-title">RELATORIO DE CASOS - NEXO TERMINAL</h2>
        <p className="stats-subtitle">{loading ? 'Carregando Firebase...' : 'Estatisticas globais (Firebase)'}</p>
      </div>

      <div className="stats-summary">
        <div className="stats-summary-row">
          <span>Total de casos jogados:</span>
          <span className="stats-value">{summary.totalPlayed}</span>
        </div>
        <div className="stats-summary-row">
          <span>Casos resolvidos:</span>
          <span className="stats-value highlight">{summary.totalSolved}</span>
        </div>
        <div className="stats-summary-row">
          <span>Casos falhos:</span>
          <span className="stats-value">{summary.totalFailed}</span>
        </div>
      </div>

      <div className="stats-table-section">
        <h3>Jogadas por dia (data, codigo do caso, resolvidos/falhos)</h3>
        <div className="stats-table">
          <div className="stats-table-header">
            <span>Data</span>
            <span>Codigo</span>
            <span>#</span>
            <span>Jogados</span>
            <span>Resolvidos</span>
            <span>Falhos</span>
          </div>
          {loading ? (
            <div className="stats-empty">Carregando...</div>
          ) : byDay.length === 0 ? (
            <div className="stats-empty">Nenhum caso registrado no Firebase.</div>
          ) : (
            byDay.map((row) => (
              <div key={row.date} className="stats-table-row">
                <span>{row.date}</span>
                <span className="stats-code">{row.caseCode || '-'}</span>
                <span>#{row.caseNumber}</span>
                <span>{row.played}</span>
                <span className="status-ok">{row.solved}</span>
                <span className="status-fail">{row.failed}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="stats-local-section">
        <h3>Seu historico local (localStorage)</h3>
        <div className="stats-summary-row">
          <span>Dias jogados:</span>
          <span>{localStats.summary.total}</span>
        </div>
        <div className="stats-summary-row">
          <span>Resolvidos:</span>
          <span className="highlight">{localStats.summary.solved}</span>
        </div>
        <div className="stats-summary-row">
          <span>Media precisao:</span>
          <span>{localStats.summary.avgAccuracy}%</span>
        </div>
      </div>

      <button className="stats-back" onClick={onBack}>
        &gt; VOLTAR
      </button>
    </div>
  )
}

export default Stats
