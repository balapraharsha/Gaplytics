import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEP_CONFIG = {
  detection: { label: 'DETECTION', color: '#88B4C4', bg: 'rgba(136,180,196,0.08)', border: 'rgba(136,180,196,0.2)' },
  gap: { label: 'GAP', color: '#CF9D7B', bg: 'rgba(207,157,123,0.08)', border: 'rgba(207,157,123,0.2)' },
  decision: { label: 'DECISION', color: '#7A9E7E', bg: 'rgba(122,158,126,0.08)', border: 'rgba(122,158,126,0.2)' },
  chain: { label: 'CHAIN', color: '#B090B0', bg: 'rgba(176,144,176,0.08)', border: 'rgba(176,144,176,0.2)' },
}

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
      <path d="M4 6L8 10L12 6" stroke="rgba(207,157,123,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ReasoningTrace({ trace = [] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="autumn-card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '16px 22px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: open ? '1px solid rgba(207,157,123,0.1)' : 'none',
        }}
      >
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#EDE0D0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C6.3 2 5 3.3 5 5V11C5 12.7 6.3 14 8 14C9.7 14 11 12.7 11 11V5C11 3.3 9.7 2 8 2Z" stroke="#CF9D7B" strokeWidth="1.1"/>
            <path d="M5 6H3.5C2.7 6 2 6.7 2 7.5C2 8.3 2.7 9 3.5 9H5" stroke="#CF9D7B" strokeWidth="1.1"/>
            <path d="M11 6H12.5C13.3 6 14 6.7 14 7.5C14 8.3 13.3 9 12.5 9H11" stroke="#CF9D7B" strokeWidth="1.1"/>
          </svg>
          AI Reasoning Trace
        </span>
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '18px 22px', maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trace.map((step, i) => {
                const cfg = STEP_CONFIG[step.type] || STEP_CONFIG.decision
                return (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.5px', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.65)', lineHeight: 1.5 }}>{step.message}</span>
                  </div>
                )
              })}
              {trace.length === 0 && (
                <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.4)', textAlign: 'center', padding: '20px 0' }}>
                  No reasoning trace available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
