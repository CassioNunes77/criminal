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
    this.minInterval = 15 // Shorter interval for more responsive 80s terminal feel
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
      // 80s terminal/computer beep sound - short, electronic, characteristic
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Classic 80s terminal beep frequency range (800-1200 Hz)
      // Slight variation for realism
      const baseFreq = 900 + Math.random() * 200
      oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
      
      // Square wave for that classic digital/electronic sound
      oscillator.type = 'square'
      
      // Quick attack and decay - characteristic terminal beep
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.002) // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.015) // Fast decay
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
}
