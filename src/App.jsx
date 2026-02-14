import { useState, useEffect } from 'react'
import Home from './components/Home'
import CaseDescription from './components/CaseDescription'
import Investigation from './components/Investigation'
import Result from './components/Result'
import { getDailyCrimeFromFirebase } from './utils/crimeService'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')
  const [currentCrime, setCurrentCrime] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [offlineNoCache, setOfflineNoCache] = useState(false)
  const [x7, setX7] = useState(false)
  const [investigationState, setInvestigationState] = useState({
    cluesDiscovered: 0,
    cluesRevealed: [],
    witnessesViewed: [],
    attempts: 0,
    hypothesis: {
      suspect: null,
      location: null,
      method: null
    },
    streak: 0,
    solved: false,
    failed: false
  })

  const load = async () => {
    const startTime = Date.now()
    const minLoadTime = 1000
    try {
      setOfflineNoCache(false)
      setIsLoading(true)
      const crime = await getDailyCrimeFromFirebase()
      setCurrentCrime(crime)
      if (!crime) {
        setOfflineNoCache(true)
        setIsLoading(false)
        return
      }
      try {
        const savedState = localStorage.getItem(`crime_${crime.id}`)
        if (savedState) {
          const parsed = JSON.parse(savedState)
          const sanitizedState = {
            cluesDiscovered: parsed.cluesDiscovered || 0,
            cluesRevealed: parsed.cluesRevealed || [],
            witnessesViewed: parsed.witnessesViewed || [],
            attempts: Math.max(0, Math.min(parsed.attempts || 0, 3)),
            hypothesis: parsed.hypothesis || { suspect: null, location: null, method: null },
            streak: parsed.streak || 0,
            solved: parsed.solved || false,
            failed: parsed.failed || false,
            solvedStats: parsed.solvedStats || (parsed.solved ? {
              attempts: parsed.attempts || 0,
              cluesDiscovered: parsed.cluesDiscovered || 0,
              witnessesViewed: parsed.witnessesViewed || []
            } : null)
          }
          setInvestigationState(sanitizedState)
        }
      } catch (e) {
        console.warn('Error loading saved state:', e)
        setInvestigationState({
          cluesDiscovered: 0,
          cluesRevealed: [],
          witnessesViewed: [],
          attempts: 0,
          hypothesis: { suspect: null, location: null, method: null },
          streak: 0,
          solved: false,
          failed: false
        })
      }
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadTime - elapsed)
      setTimeout(() => setIsLoading(false), remainingTime)
    } catch (error) {
      console.error('Error loading crime:', error)
      setOfflineNoCache(true)
      setTimeout(() => setIsLoading(false), minLoadTime)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const startInvestigation = (opts) => {
    setX7(!!(opts?.x))
    setScreen('caseDescription')
  }

  const acceptMission = () => {
    setScreen('investigation')
  }

  const viewWitness = (witnessIndex) => {
    if (!currentCrime) return
    const viewed = investigationState.witnessesViewed || []
    if (viewed.includes(witnessIndex)) return
    const newState = {
      ...investigationState,
      witnessesViewed: [...viewed, witnessIndex]
    }
    setInvestigationState(newState)
    if (!investigationState.solved) saveState(newState) // Só persiste se não concluiu
  }

  const discoverClue = (clueType) => {
    if (!currentCrime) return
    if (investigationState.cluesRevealed?.includes(clueType)) return // Já revelada
    
    const newState = {
      ...investigationState,
      cluesDiscovered: investigationState.solved ? investigationState.cluesDiscovered : investigationState.cluesDiscovered + 1, // Não altera contagem se já concluiu
      cluesRevealed: [...(investigationState.cluesRevealed || []), clueType]
    }
    setInvestigationState(newState)
    if (!investigationState.solved) saveState(newState) // Só persiste se não concluiu
  }

  const makeAccusation = (suspect, location, method) => {
    if (!currentCrime) return false
    
    // Se já solucionou o caso, não altera estatísticas nem estado; apenas mostra resultado
    if (investigationState.solved) {
      setScreen('result')
      return true
    }
    
    const maxAttempts = x7 ? 999 : 3
    const currentAttempts = investigationState.attempts + 1

    if (investigationState.failed) return false

    const isCorrect =
      suspect === currentCrime.solution.suspect &&
      location === currentCrime.solution.location &&
      method === currentCrime.solution.method

    const newState = {
      ...investigationState,
      attempts: currentAttempts,
      hypothesis: { suspect, location, method },
      solved: isCorrect,
      failed: !isCorrect && currentAttempts >= maxAttempts,
      streak: isCorrect ? investigationState.streak + 1 : investigationState.streak,
      ...(isCorrect && {
        solvedStats: {
          attempts: currentAttempts,
          cluesDiscovered: investigationState.cluesDiscovered || 0,
          witnessesViewed: [...(investigationState.witnessesViewed || [])]
        }
      })
    }
    
    setInvestigationState(newState)
    saveState(newState)
    
    if (isCorrect) {
      setScreen('result')
    } else if (currentAttempts >= maxAttempts) {
      // Case failed, show failure screen
      setTimeout(() => {
        setScreen('result')
      }, 3000)
    }
    
    return isCorrect
  }

  const saveState = (state) => {
    if (currentCrime) {
      localStorage.setItem(`crime_${currentCrime.id}`, JSON.stringify({
        ...state,
        date: new Date().toDateString()
      }))
    }
  }

  if (offlineNoCache) {
    return (
      <div className="app" style={{
        minHeight: '100vh',
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#020403',
        color: '#00CC55',
        fontFamily: "'PxPlus IBM VGA8', monospace",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '24px 32px',
          border: '2px solid #FF6600',
          background: 'rgba(255, 102, 0, 0.06)',
          color: '#FF6600',
          fontFamily: "'PxPlus IBM VGA8', monospace",
          fontSize: '14px',
          lineHeight: 1.8,
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          *** NO CARRIER ***
          <br /><br />
          CONEXAO REMOTA INDISPONIVEL.
          <br />
          Caso do dia nao disponivel (sem internet, caso nao gerado ou falha de conexao).
          <br /><br />
          <span style={{ color: '#00CC55', fontSize: '13px' }}>
            Verifique sua conexao e tente novamente.
          </span>
        </div>
        <button
          onClick={load}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: 'none',
            border: '1px solid #00FF66',
            color: '#00FF66',
            fontFamily: "'PxPlus IBM VGA8', monospace",
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          &gt; TENTAR NOVAMENTE
        </button>
      </div>
    )
  }

  if (!currentCrime || isLoading) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#00CC55',
        fontFamily: "'PxPlus IBM VGA8', monospace",
        background: '#020403'
      }}>
        CARREGANDO TERMINAL...
        <span className="cursor-blink" style={{ marginLeft: '4px' }}>█</span>
      </div>
    )
  }

  return (
    <div className="app" style={{
      minHeight: '100vh',
      padding: '16px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#020403',
      color: '#00CC55',
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      {screen === 'home' && (
        <Home 
          crime={currentCrime}
          streak={investigationState.streak}
          onStart={startInvestigation}
        />
      )}
      {screen === 'caseDescription' && (
        <CaseDescription
          crime={currentCrime}
          onAccept={acceptMission}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'investigation' && (
        <Investigation
          crime={currentCrime}
          state={investigationState}
          x7={x7}
          onDiscoverClue={discoverClue}
          onViewWitness={viewWitness}
          onMakeAccusation={makeAccusation}
          onViewResult={() => setScreen('result')}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'result' && (
        <Result
          crime={currentCrime}
          state={investigationState}
          onBack={() => setScreen('home')}
          onBackToInvestigation={() => setScreen('investigation')}
        />
      )}
    </div>
  )
}

export default App
