import { useState, useEffect } from 'react'
import Home from './components/Home'
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
    // Load daily crime
    const crime = getDailyCrime()
    setCurrentCrime(crime)
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem(`crime_${crime.id}`)
    if (savedState) {
      const parsed = JSON.parse(savedState)
      setInvestigationState(parsed)
      if (parsed.solved) {
        setScreen('result')
      } else if (parsed.cluesDiscovered > 0) {
        setScreen('investigation')
      }
    }
  }, [])

  const startInvestigation = () => {
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
    return <div className="loading">CARREGANDO TERMINAL...</div>
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <Home 
          crime={currentCrime}
          streak={investigationState.streak}
          onStart={startInvestigation}
        />
      )}
      {screen === 'investigation' && (
        <Investigation
          crime={currentCrime}
          state={investigationState}
          onDiscoverClue={discoverClue}
          onMakeAccusation={makeAccusation}
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
