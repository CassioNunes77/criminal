// Typewriter sound generator for DOS terminal era
export function createTypewriterSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  const playClick = () => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Typewriter click sound - short, sharp, low frequency
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.01)
    
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  }
  
  return { playClick, audioContext }
}

// Class to manage typewriter sound
export class TypewriterSound {
  constructor() {
    this.audioContext = null
    this.isEnabled = true
    this.lastPlayTime = 0
    this.minInterval = 20 // Responsive interval for natural typing feel
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
      this.isEnabled = false
    }
  }

  play() {
    if (!this.isEnabled || !this.audioContext) return
    
    const now = Date.now()
    if (now - this.lastPlayTime < this.minInterval) return
    
    this.lastPlayTime = now

    try {
      // Natural, pleasant typing sound - simple and clean
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Natural typing frequency - mid-range, pleasant
      const baseFreq = 600 + Math.random() * 100 // 600-700 Hz - natural typing range
      oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
      
      // Triangle wave for softer, more natural sound than square
      oscillator.type = 'triangle'
      
      // Clean, natural volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.001) // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.003, this.audioContext.currentTime + 0.015) // Natural decay
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.025) // Quick fade
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.025)
    } catch (e) {
      // Silently fail if audio context is suspended
      if (e.name !== 'InvalidStateError') {
        console.warn('Error playing sound:', e)
      }
    }
  }

  stop() {
    // Sound is very short, no need to stop
  }

  playGlitch() {
    if (!this.isEnabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.04)

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.08)
    } catch (e) {
      if (e.name !== 'InvalidStateError') {
        console.warn('Error playing glitch sound:', e)
      }
    }
  }
}
