import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const BOOT_LINES = [
  'Nexo BIOS Version 1.00',
  'Copyright 1985-1990 Nexo Technologies Ltd.',
  '',
  '640K Base Memory',
  '3072K Extended Memory',
  '',
  'carregando terminal...'
]

function LoadingScreen() {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount >= BOOT_LINES.length) return
    const delay = visibleCount === 0 ? 300 : (BOOT_LINES[visibleCount] === '' ? 150 : 120)
    const t = setTimeout(() => setVisibleCount(c => c + 1), delay)
    return () => clearTimeout(t)
  }, [visibleCount])

  return (
    <div className="loading-screen">
      <div className="loading-boot">
        {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
          <div key={i} className="loading-line">
            {line}
          </div>
        ))}
        {visibleCount < BOOT_LINES.length && (
          <span className="cursor-blink">█</span>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen
