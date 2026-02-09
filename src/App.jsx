import { useState, useEffect } from 'react'
import Home from './components/Home'
import CaseDescription from './components/CaseDescription'
import CaseView from './components/CaseView'
import Investigation from './components/Investigation'
import Result from './components/Result'
import { getDailyCrime } from './utils/dailySeed'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')
  const [currentCrime, setCurrentCrime] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    const startTime = Date.now()
    const minLoadTime = 1000 // Minimum 1 second

    try {
      // Load daily crime
      const crime = getDailyCrime()
      setCurrentCrime(crime)
      
      // Load saved state from localStorage (but always start at home screen)
      try {
        const savedState = localStorage.getItem(`crime_${crime.id}`)
        if (savedState) {
          const parsed = JSON.parse(savedState)
          // Validate and sanitize saved state
          const sanitizedState = {
            cluesDiscovered: parsed.cluesDiscovered || 0,
            cluesRevealed: parsed.cluesRevealed || [],
            witnessesViewed: parsed.witnessesViewed || [],
            attempts: Math.max(0, Math.min(parsed.attempts || 0, 3)), // Ensure between 0 and 3
            hypothesis: parsed.hypothesis || {
              suspect: null,
              location: null,
              method: null
            },
            streak: parsed.streak || 0,
            solved: parsed.solved || false,
            failed: parsed.failed || false
          }
          setInvestigationState(sanitizedState)
          // Always start at home screen, regardless of saved state
        }
      } catch (e) {
        console.warn('Error loading saved state:', e)
        // Reset to initial state on error
        setInvestigationState({
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
      }

      // Ensure minimum loading time of 1 second
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadTime - elapsed)
      
      setTimeout(() => {
        setIsLoading(false)
      }, remainingTime)
    } catch (error) {
      console.error('Error loading crime:', error)
      setTimeout(() => {
        setIsLoading(false)
      }, minLoadTime)
    }
  }, [])

  const startInvestigation = () => {
    setScreen('caseDescription')
  }

  const acceptMission = () => {
    setScreen('investigation')
  }

  const discoverClue = () => {
    if (!currentCrime) return
    
    const newState = {
      ...investigationState,
      cluesDiscovered: investigationState.cluesDiscovered + 1
    }
    setInvestigationState(newState)
    saveState(newState)
  }

  const makeAccusation = (suspect, location, method) => {
    if (!currentCrime) return false
    
    const maxAttempts = 3
    const currentAttempts = investigationState.attempts + 1
    
    // Check if already failed
    if (investigationState.failed) {
      return false
    }
    
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
      streak: isCorrect ? investigationState.streak + 1 : investigationState.streak
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
      {screen === 'caseView' && (
        <CaseView
          crime={currentCrime}
          onBack={() => setScreen('investigation')}
        />
      )}
      {screen === 'investigation' && (
        <Investigation
          crime={currentCrime}
          state={investigationState}
          onDiscoverClue={discoverClue}
          onMakeAccusation={makeAccusation}
          onViewCase={() => setScreen('caseView')}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'result' && (
        <Result
          crime={currentCrime}
          state={investigationState}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}

export default App
