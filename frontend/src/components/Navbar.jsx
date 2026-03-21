import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

function LogoIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="0.5" y="0.5" width="29" height="29" rx="7" fill="rgba(22,33,39,0.9)" stroke="rgba(207,157,123,0.22)" strokeWidth="1"/>
      <rect x="3" y="12" width="9" height="6" rx="2.5" fill="#724B39"/>
      <rect x="18" y="12" width="9" height="6" rx="2.5" fill="#CF9D7B"/>
      <path d="M12 15 L18 15" stroke="rgba(207,157,123,0.45)" strokeWidth="1.5" strokeDasharray="2 1.5"/>
    </svg>
  )
}

function ChevronRight() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="rgba(207,157,123,0.3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
}

function HelpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="rgba(207,157,123,0.4)" strokeWidth="1.2"/>
      <path d="M5.5 5.5C5.5 4.4 6.4 3.5 7.5 3.5C8.6 3.5 9.5 4.4 9.5 5.5C9.5 6.6 8.5 7 7.5 8" stroke="#CF9D7B" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7.5" cy="10.5" r="0.7" fill="#CF9D7B"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M8.5 1C4.36 1 1 4.36 1 8.5C1 11.82 3.14 14.63 6.11 15.64C6.49 15.71 6.62 15.47 6.62 15.27V13.97C4.51 14.43 4.08 13.01 4.08 13.01C3.73 12.14 3.24 11.9 3.24 11.9C2.56 11.42 3.3 11.43 3.3 11.43C4.05 11.47 4.44 12.19 4.44 12.19C5.11 13.34 6.21 12.99 6.64 12.8C6.7 12.3 6.91 11.96 7.13 11.76C5.44 11.57 3.67 10.91 3.67 8.05C3.67 7.24 3.96 6.56 4.45 6.03C4.37 5.84 4.12 5.06 4.52 4C4.52 4 5.15 3.79 6.62 4.79C7.23 4.63 7.88 4.54 8.5 4.54C9.12 4.54 9.77 4.63 10.38 4.79C11.85 3.79 12.48 4 12.48 4C12.88 5.06 12.63 5.84 12.55 6.03C13.04 6.56 13.33 7.24 13.33 8.05C13.33 10.92 11.56 11.56 9.86 11.75C10.14 11.99 10.38 12.47 10.38 13.21V15.27C10.38 15.47 10.51 15.71 10.9 15.64C13.86 14.63 16 11.82 16 8.5C16 4.36 12.64 1 8.5 1Z" fill="rgba(207,157,123,0.45)"/>
    </svg>
  )
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="rgba(207,157,123,0.55)" strokeWidth="1.4" strokeLinecap="round"/></svg>
}

function HowItWorksModal({ onClose }) {
  const steps = [
    { n: '01', title: 'HR Posts Role', desc: 'HR uploads a Job Description and sets a company training deadline.' },
    { n: '02', title: 'Grok Extracts Requirements', desc: 'Gemini AI identifies all required skills and proficiency levels from the JD.' },
    { n: '03', title: 'Candidate Uploads Resume', desc: 'Candidate uploads their resume and sets a personal target deadline.' },
    { n: '04', title: 'Skill Gap Analysis', desc: 'AI computes a precise gap score, identifies critical missing skills, and generates rejection predictors.' },
    { n: '05', title: 'Adaptive Roadmap', desc: 'Graph-based scheduler generates a day-by-day learning plan from today to deadline.' },
    { n: '06', title: 'Score-Gated Interview', desc: 'Candidates at 90%+ unlock a full 12-question Mock Technical Interview with 9-dimension evaluation.' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(12,21,25,0.82)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        className="autumn-card"
        style={{ padding: '32px', maxWidth: 520, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 26, color: '#EDE0D0', margin: 0 }}>
            How Gaplytics Works
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(207,157,123,0.18),transparent)', marginBottom: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 34, height: 34, borderRadius: 9,
                background: 'rgba(114,75,57,0.18)', border: '1px solid rgba(207,157,123,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: 10,
                color: 'var(--brass)', flexShrink: 0,
              }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#EDE0D0', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.58)', lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Navbar({ role }) {
  const [showHow, setShowHow] = useState(false)
  const location = useLocation()

  const candidateSteps = [
    { label: 'Upload', path: '/candidate' },
    { label: 'Analysis', path: '/candidate/dashboard' },
    { label: 'Roadmap', path: '/candidate/roadmap' },
    { label: 'Interview', path: '/candidate/interview' },
  ]

  const isCandidatePage = location.pathname.startsWith('/candidate')
  const isHRPage = location.pathname.startsWith('/hr')
  const currentStepIdx = candidateSteps.findIndex(s => s.path === location.pathname)

  return (
    <>
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoIcon />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 19, color: '#EDE0D0', letterSpacing: '0.04em' }}>
            GAPLYTICS
          </span>
        </Link>

        {/* Candidate breadcrumb */}
        {isCandidatePage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {candidateSteps.map((step, i) => {
              const isActive = location.pathname === step.path
              const isPast = currentStepIdx > i
              return (
                <div key={step.path} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Link to={step.path} style={{
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: isActive ? 'var(--brass)' : isPast ? 'var(--success-text)' : 'rgba(207,157,123,0.38)',
                    padding: '4px 10px', borderRadius: 6,
                    background: isActive ? 'rgba(207,157,123,0.1)' : 'transparent',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}>
                    {step.label}
                  </Link>
                  {i < candidateSteps.length - 1 && <ChevronRight />}
                </div>
              )
            })}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isHRPage && (
            <span style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 10, fontWeight: 600,
              padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'rgba(58,53,52,0.55)', color: 'var(--brass)',
              border: '1px solid var(--coffee-border)', borderRadius: 6,
            }}>HR Portal</span>
          )}
          {isCandidatePage && (
            <span style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 10, fontWeight: 600,
              padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'rgba(22,33,39,0.75)', color: 'var(--brass)',
              border: '1px solid var(--brass-border)', borderRadius: 6,
            }}>Candidate</span>
          )}
          <button
            onClick={() => setShowHow(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(22,33,39,0.65)', border: '1px solid var(--brass-border)',
              color: 'rgba(207,157,123,0.55)', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer',
              fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brass-border-hover)'; e.currentTarget.style.color = 'var(--brass)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--brass-border)'; e.currentTarget.style.color = 'rgba(207,157,123,0.55)'; }}
          >
            <HelpIcon /> How It Works
          </button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', opacity: 1, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <GithubIcon />
          </a>
        </div>
      </nav>

      <AnimatePresence>
        {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}
      </AnimatePresence>
    </>
  )
}
