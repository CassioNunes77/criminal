import { useState, useEffect } from 'react'
import Home from './components/Home'
import CaseDescription from './components/CaseDescription'
import Investigation from './components/Investigation'
import Result from './components/Result'
import Dossier from './components/Dossier'
import Stats from './components/Stats'
import LoadingScreen from './components/LoadingScreen'
import { getDailyCrimeFromFirebase, normalizeCrime } from './utils/crimeService'
import { getDailyCrime } from './utils/dailySeed'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')
  const [currentCrime, setCurrentCrime] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(true)
      let crime = await getDailyCrimeFromFirebase()
      if (!crime) {
        crime = getDailyCrime()
        crime = normalizeCrime({ ...crime, caseCode: String(crime.id), caseNumber: String(crime.id).slice(-4).padStart(4, '0') })
      }
      setCurrentCrime(crime)
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
      try {
        const fallback = getDailyCrime()
        setCurrentCrime(normalizeCrime({ ...fallback, caseCode: String(fallback.id), caseNumber: String(fallback.id).slice(-4).padStart(4, '0') }))
      } catch (_) {}
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
    
    const caseEnded = investigationState.solved || investigationState.failed
    const newState = {
      ...investigationState,
      cluesDiscovered: caseEnded ? investigationState.cluesDiscovered : investigationState.cluesDiscovered + 1,
      cluesRevealed: [...(investigationState.cluesRevealed || []), clueType]
    }
    setInvestigationState(newState)
    if (!caseEnded) saveState(newState)
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

    const norm = (s) => (s ?? '').trim().replace(/\s+/g, ' ')
    const isCorrect =
      norm(suspect) === norm(currentCrime.solution.suspect) &&
      norm(location) === norm(currentCrime.solution.location) &&
      norm(method) === norm(currentCrime.solution.method)

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
        date: new Date().toDateString(),
        caseCode: currentCrime.caseCode,
        caseNumber: currentCrime.caseNumber
      }))
    }
  }

  if (!currentCrime || isLoading) {
    return <LoadingScreen />
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
          onShowStats={() => setScreen('stats')}
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
          onViewDossier={() => setScreen('dossier')}
        />
      )}
      {screen === 'dossier' && (
        <Dossier
          crime={currentCrime}
          onBack={() => setScreen('result')}
        />
      )}
      {screen === 'stats' && (
        <Stats onBack={() => setScreen('home')} />
      )}
    </div>
  )
}

export default App
