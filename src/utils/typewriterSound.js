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
    this.minInterval = 25 // Balanced interval for comfortable keyboard feel
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
      // Soft keyboard typing sound - discrete, audible, comfortable
      // Using a combination of frequencies to simulate a soft key press
      const oscillator1 = this.audioContext.createOscillator()
      const oscillator2 = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      const merger = this.audioContext.createChannelMerger(2)
      
      // Main frequency - soft keyboard click (around 400-500 Hz)
      const mainFreq = 450 + Math.random() * 50
      oscillator1.frequency.setValueAtTime(mainFreq, this.audioContext.currentTime)
      oscillator1.type = 'sine'
      
      // Subtle harmonic for realism (higher frequency, quieter)
      const harmonicFreq = mainFreq * 2.5
      oscillator2.frequency.setValueAtTime(harmonicFreq, this.audioContext.currentTime)
      oscillator2.type = 'sine'
      
      // Connect oscillators to merger
      oscillator1.connect(merger, 0, 0)
      oscillator2.connect(merger, 0, 1)
      merger.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Soft, comfortable volume - audible but discrete
      const mainVolume = 0.04 // Main frequency volume
      const harmonicVolume = 0.01 // Harmonic volume (quieter)
      
      // Quick, soft attack and smooth decay - like a gentle key press
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(mainVolume, this.audioContext.currentTime + 0.003) // Quick soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.005, this.audioContext.currentTime + 0.025) // Smooth decay
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.04) // Gentle fade
      
      oscillator1.start(this.audioContext.currentTime)
      oscillator2.start(this.audioContext.currentTime)
      oscillator1.stop(this.audioContext.currentTime + 0.04)
      oscillator2.stop(this.audioContext.currentTime + 0.04)
    } catch (e) {
      // Fallback to simple sine wave if merger fails
      try {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        // Soft keyboard frequency
        const baseFreq = 450 + Math.random() * 50
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
        oscillator.type = 'sine'
        
        // Comfortable volume
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.04, this.audioContext.currentTime + 0.003)
        gainNode.gain.exponentialRampToValueAtTime(0.005, this.audioContext.currentTime + 0.025)
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.04)
        
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + 0.04)
      } catch (e2) {
        // Silently fail if audio context is suspended
        if (e2.name !== 'InvalidStateError') {
          console.warn('Error playing sound:', e2)
        }
      }
    }
  }

  stop() {
    // Sound is very short, no need to stop
  }
}
