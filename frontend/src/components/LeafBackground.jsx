import { useMemo } from 'react'

// Floating dust/particle background using the palette
export default function LeafBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 6,
      left: Math.random() * 100,
      delay: Math.random() * 25,
      duration: 20 + Math.random() * 30,
      drift: (Math.random() - 0.5) * 80,
      color: [
        'rgba(207,157,123,0.5)',
        'rgba(114,75,57,0.4)',
        'rgba(58,53,52,0.6)',
        'rgba(207,157,123,0.25)',
        'rgba(22,33,39,0.8)',
      ][i % 5],
    }))
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '5%',
        width: 500, height: 400,
        background: 'radial-gradient(ellipse, rgba(114,75,57,0.06), transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%', right: '8%',
        width: 400, height: 500,
        background: 'radial-gradient(ellipse, rgba(22,33,39,0.8), transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(207,157,123,0.02), transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-20px',
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            boxShadow: p.size > 5 ? `0 0 ${p.size * 2}px ${p.color}` : 'none',
          }}
        />
      ))}
    </div>
  )
}
