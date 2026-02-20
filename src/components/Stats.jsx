import { getDailyStats } from '../utils/statsUtils'
import './Stats.css'

function Stats({ onBack }) {
  const { byDay, summary } = getDailyStats()

  return (
    <div className="stats-screen">
      <div className="stats-header">
        <h2 className="stats-title">RELATORIO DE CASOS - NEXO TERMINAL</h2>
        <p className="stats-subtitle">Estatisticas locais (localStorage)</p>
      </div>

      <div className="stats-summary">
        <div className="stats-summary-row">
          <span>Total de dias jogados:</span>
          <span className="stats-value">{summary.total}</span>
        </div>
        <div className="stats-summary-row">
          <span>Casos resolvidos:</span>
          <span className="stats-value highlight">{summary.solved}</span>
        </div>
        <div className="stats-summary-row">
          <span>Casos encerrados (falha):</span>
          <span className="stats-value">{summary.failed}</span>
        </div>
        <div className="stats-summary-row">
          <span>Media de precisao (resolvidos):</span>
          <span className="stats-value">{summary.avgAccuracy}%</span>
        </div>
      </div>

      <div className="stats-table-section">
        <h3>Historico por dia (codigo do caso para pesquisa)</h3>
        <div className="stats-table">
          <div className="stats-table-header">
            <span>Data</span>
            <span>Codigo</span>
            <span>#</span>
            <span>Status</span>
            <span>Precisao</span>
            <span>Tent.</span>
          </div>
          {byDay.length === 0 ? (
            <div className="stats-empty">Nenhum caso registrado.</div>
          ) : (
            byDay.map((row) => (
              <div key={row.dateId} className="stats-table-row">
                <span>{row.date}</span>
                <span className="stats-code">{row.caseCode || '-'}</span>
                <span>#{row.caseNumber}</span>
                <span className={row.solved ? 'status-ok' : 'status-fail'}>
                  {row.solved ? 'RESOLVIDO' : 'ENCERRADO'}
                </span>
                <span>{row.accuracy}%</span>
                <span>{row.attempts}/3</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="stats-back" onClick={onBack}>
        &gt; VOLTAR
      </button>
    </div>
  )
}

export default Stats
