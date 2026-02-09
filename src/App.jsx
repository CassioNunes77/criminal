import { useState, useEffect } from 'react'
import Home from './components/Home'
import CaseDescription from './components/CaseDescription'
import Investigation from './components/Investigation'
import Result from './components/Result'
import { getDailyCrime } from './utils/dailySeed'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')
  const [currentCrime, setCurrentCrime] = useState(null)
  const [investigationState, setInvestigationState] = useState({
    cluesDiscovered: 0,
    attempts: 0,
    hypothesis: {
      suspect: null,
      location: null,
      method: null
    },
    streak: 0
  })

  useEffect(() => {
    try {
      // Load daily crime
      const crime = getDailyCrime()
      setCurrentCrime(crime)
      
      // Load saved state from localStorage (but always start at home screen)
      try {
        const savedState = localStorage.getItem(`crime_${crime.id}`)
        if (savedState) {
          const parsed = JSON.parse(savedState)
          setInvestigationState(parsed)
          // Always start at home screen, regardless of saved state
        }
      } catch (e) {
        console.warn('Error loading saved state:', e)
      }
    } catch (error) {
      console.error('Error loading crime:', error)
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
      cluesDiscovered: Math.min(
        investigationState.cluesDiscovered + 1,
        currentCrime.clues.length
      )
    }
    setInvestigationState(newState)
    saveState(newState)
  }

  const makeAccusation = (suspect, location, method) => {
    if (!currentCrime) return false
    
    const isCorrect = 
      suspect === currentCrime.solution.suspect &&
      location === currentCrime.solution.location &&
      method === currentCrime.solution.method

    const newState = {
      ...investigationState,
      attempts: investigationState.attempts + 1,
      hypothesis: { suspect, location, method },
      solved: isCorrect,
      streak: isCorrect ? investigationState.streak + 1 : 0
    }
    
    setInvestigationState(newState)
    saveState(newState)
    
    if (isCorrect) {
      setScreen('result')
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

  if (!currentCrime) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#00CC55',
        fontFamily: 'IBM Plex Mono, monospace',
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
        />
      )}
      {screen === 'investigation' && (
        <Investigation
          crime={currentCrime}
          state={investigationState}
          onDiscoverClue={discoverClue}
          onMakeAccusation={makeAccusation}
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
