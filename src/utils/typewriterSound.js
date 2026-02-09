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
    this.minInterval = 25 // Longer interval for softer, more natural effect
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
      // Create a very soft typing sound using white noise filtered
      const bufferSize = this.audioContext.sampleRate * 0.02 // 20ms
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      // Generate soft white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1 // Very quiet white noise
      }
      
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()
      
      // Low-pass filter for softer sound
      filter.type = 'lowpass'
      filter.frequency.value = 2000 // Cut high frequencies
      filter.Q.value = 1
      
      source.buffer = buffer
      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Very subtle volume envelope
      gainNode.gain.setValueAtTime(0.015, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02)
      
      source.start(this.audioContext.currentTime)
      source.stop(this.audioContext.currentTime + 0.02)
    } catch (e) {
      // Fallback to very soft sine wave if buffer creation fails
      try {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        // Very soft, low frequency sine wave
        const baseFreq = 200 + Math.random() * 50
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
        oscillator.type = 'sine'
        
        // Extremely low volume
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05)
        
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + 0.05)
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
