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
    this.minInterval = 30 // Longer interval for softer, more comfortable feel
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
      // Soft, comfortable typing sound - very subtle and pleasant
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Very low, soft frequency - gentle and comfortable
      const baseFreq = 150 + Math.random() * 50 // 150-200 Hz - very low and soft
      oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
      
      // Sine wave for smooth, soft sound
      oscillator.type = 'sine'
      
      // Very gentle attack and smooth decay - comfortable typing sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.012, this.audioContext.currentTime + 0.005) // Gentle attack
      gainNode.gain.exponentialRampToValueAtTime(0.002, this.audioContext.currentTime + 0.03) // Smooth decay
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05) // Gentle fade
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.05)
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
