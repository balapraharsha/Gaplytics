import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function BriefcaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="13" rx="3" stroke="#CF9D7B" strokeWidth="1.5"/>
      <path d="M8 8V6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V8" stroke="#CF9D7B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 13H21" stroke="#CF9D7B" strokeWidth="1" strokeOpacity="0.35"/>
    </svg>
  )
}

function UserCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="4" stroke="#CF9D7B" strokeWidth="1.5"/>
      <path d="M2 21C2 17.134 5.134 14 9 14" stroke="#CF9D7B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 17L17 19L21 15" stroke="#CF9D7B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckmarkIcon({ color = '#CF9D7B' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill={`${color}18`} stroke={`${color}28`}/>
      <path d="M4.5 7L6 8.5L9.5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const words = ['Close', 'the', 'Gap.', 'Own', 'the', 'Role.']

const featureRow = [
  { label: 'AWS Bedrock AI', detail: 'Claude 3 Haiku (Anthropic)' },
  { label: 'Graph-based Pathing', detail: 'Kahn topological sort' },
  { label: '50+ Course Catalog', detail: 'All domains covered' },
  { label: 'Score-Gated Interviews', detail: '12 questions × 9 dimensions' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', position: 'relative', zIndex: 1,
    }}>

      {/* Top rule */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(207,157,123,0.14),transparent)', transformOrigin: 'center' }}
      />

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 64, maxWidth: 720 }}>

        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, type: 'spring', bounce: 0.25 }}
          style={{ marginBottom: 28 }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ margin: '0 auto', display: 'block' }}>
            <rect x="1" y="1" width="58" height="58" rx="16" fill="rgba(22,33,39,0.88)" stroke="rgba(207,157,123,0.2)" strokeWidth="1"/>
            <rect x="7" y="25" width="19" height="10" rx="4.5" fill="#724B39"/>
            <rect x="34" y="25" width="19" height="10" rx="4.5" fill="#CF9D7B"/>
            <path d="M26 30L34 30" stroke="rgba(207,157,123,0.45)" strokeWidth="2" strokeDasharray="3 2"/>
            <circle cx="30" cy="14" r="7" fill="none" stroke="rgba(207,157,123,0.28)" strokeWidth="1.2"/>
            <circle cx="30" cy="14" r="2.5" fill="#CF9D7B"/>
            <circle cx="30" cy="46" r="7" fill="none" stroke="rgba(114,75,57,0.4)" strokeWidth="1.2"/>
            <circle cx="30" cy="46" r="2.5" fill="#724B39"/>
          </svg>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22,
            padding: '5px 16px', borderRadius: 20,
            background: 'rgba(22,33,39,0.82)', border: '1px solid rgba(207,157,123,0.16)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CF9D7B', display: 'inline-block', boxShadow: '0 0 8px rgba(207,157,123,0.6)' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'rgba(207,157,123,0.65)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Powered by AWS Bedrock · AI Onboarding Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 500,
          fontSize: 'clamp(44px, 7vw, 80px)', lineHeight: 1.05,
          margin: '0 0 22px', letterSpacing: '-1px', color: '#EDE0D0',
        }}>
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 22, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.28 + i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'inline-block', marginRight: '0.22em' }}
              className={i >= 3 ? 'gradient-text' : ''}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
          style={{ color: 'rgba(207,157,123,0.62)', fontSize: 16.5, fontFamily: 'DM Sans, sans-serif', fontWeight: 300, margin: '0 0 6px', lineHeight: 1.65, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}
        >
          The only onboarding platform that builds a personalized training path for every hire — from day one to full competency.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}
          style={{ color: 'rgba(207,157,123,0.3)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.4px' }}
        >
          Graph-based adaptive learning · Score-gated interviews · Day-by-day roadmaps
        </motion.p>
      </div>

      {/* Role cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, width: '100%', maxWidth: 760 }}>

        {/* HR Card */}
        <motion.div
          initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 0.5, type: 'spring', bounce: 0.2 }}
          className="hr-card"
          style={{ padding: 32, cursor: 'pointer' }}
          onClick={() => { localStorage.setItem('gaplytics_role', 'hr'); navigate('/hr') }}
          whileHover={{ rotate: -0.3 }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'rgba(58,53,52,0.75)', border: '1px solid rgba(207,157,123,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}>
            <BriefcaseIcon />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, fontWeight: 500, color: 'rgba(207,157,123,0.5)', marginBottom: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            HR / Hiring Manager
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: 25, color: '#EDE0D0', margin: '0 0 10px', lineHeight: 1.2 }}>
            Onboard smarter.<br />Train precisely.
          </h2>
          <p style={{ color: 'rgba(207,157,123,0.52)', fontSize: 13, lineHeight: 1.65, margin: '0 0 22px', fontFamily: 'DM Sans, sans-serif' }}>
            Post roles, track candidates in real time, compare skill profiles, and get predicted time-to-competency for every hire.
          </p>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(207,157,123,0.14),transparent)', marginBottom: 18 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['Post Job Descriptions', 'Candidate Pipeline View', 'Side-by-Side Comparisons', 'Team Readiness Dashboard'].map(f => (
              <div key={f} style={{ fontSize: 12.5, color: 'rgba(207,157,123,0.58)', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'DM Sans, sans-serif' }}>
                <CheckmarkIcon color="#CF9D7B" /> {f}
              </div>
            ))}
          </div>
          <button className="btn-hr" style={{ width: '100%', fontSize: 13 }}>
            Enter HR Dashboard
          </button>
        </motion.div>

        {/* Candidate Card */}
        <motion.div
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.42, duration: 0.5, type: 'spring', bounce: 0.2 }}
          className="autumn-card"
          style={{ padding: 32, cursor: 'pointer' }}
          onClick={() => { localStorage.setItem('gaplytics_role', 'candidate'); navigate('/candidate') }}
          whileHover={{ rotate: 0.3 }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'rgba(22,33,39,0.9)', border: '1px solid rgba(207,157,123,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}>
            <UserCheckIcon />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, fontWeight: 500, color: 'rgba(207,157,123,0.5)', marginBottom: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            New Hire / Candidate
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500, fontSize: 25, color: '#EDE0D0', margin: '0 0 10px', lineHeight: 1.2 }}>
            Close the Gap.<br />Own the Role.
          </h2>
          <p style={{ color: 'rgba(207,157,123,0.52)', fontSize: 13, lineHeight: 1.65, margin: '0 0 22px', fontFamily: 'DM Sans, sans-serif' }}>
            Upload your resume, get a personalized skill gap analysis, and follow a day-by-day roadmap to be job-ready by your deadline.
          </p>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(207,157,123,0.14),transparent)', marginBottom: 18 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['Personalized Skill Gap Analysis', 'Day-by-Day Learning Roadmap', 'AI Chat Coach (Claude 3 Haiku)', 'Mock Technical Interview (90%+)'].map(f => (
              <div key={f} style={{ fontSize: 12.5, color: 'rgba(207,157,123,0.58)', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'DM Sans, sans-serif' }}>
                <CheckmarkIcon color="#CF9D7B" /> {f}
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}>
            Start My Journey
          </button>
        </motion.div>
      </div>

      {/* Feature strip */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}
        style={{ marginTop: 52, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}
      >
        {featureRow.map(f => (
          <div key={f.label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,33,39,0.6)', border: '1px solid rgba(58,53,52,0.55)',
            borderRadius: 6, padding: '6px 14px',
          }}>
            <span style={{ fontSize: 11.5, color: 'rgba(207,157,123,0.55)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }}>{f.label}</span>
            <span style={{ width: 1, height: 12, background: 'rgba(207,157,123,0.18)' }}/>
            <span style={{ fontSize: 10.5, color: 'rgba(207,157,123,0.32)', fontFamily: 'JetBrains Mono, monospace' }}>{f.detail}</span>
          </div>
        ))}
      </motion.div>


      {/* Demo Links — for hackathon judges */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}
        style={{
          marginTop: 32, padding: '16px 24px',
          background: 'rgba(22,33,39,0.7)', border: '1px solid rgba(207,157,123,0.18)',
          borderRadius: 10, maxWidth: 760, width: '100%', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>
          Demo Roles (Hackathon)
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Senior Backend Engineer', id: 'demo-role-001' },
            { label: 'ML Engineer', id: 'demo-role-002' },
          ].map(role => (
            <button
              key={role.id}
              onClick={() => navigate(`/candidate?role_id=${role.id}`)}
              style={{
                background: 'rgba(114,75,57,0.15)', border: '1px solid rgba(207,157,123,0.22)',
                color: 'rgba(207,157,123,0.7)', borderRadius: 7, padding: '7px 16px',
                cursor: 'pointer', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(207,157,123,0.5)'; e.currentTarget.style.color = 'var(--brass)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(207,157,123,0.22)'; e.currentTarget.style.color = 'rgba(207,157,123,0.7)' }}
            >
              Try: {role.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/hr')}
            style={{
              background: 'rgba(22,33,39,0.8)', border: '1px solid rgba(207,157,123,0.22)',
              color: 'rgba(207,157,123,0.7)', borderRadius: 7, padding: '7px 16px',
              cursor: 'pointer', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(207,157,123,0.5)'; e.currentTarget.style.color = 'var(--brass)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(207,157,123,0.22)'; e.currentTarget.style.color = 'rgba(207,157,123,0.7)' }}
          >
            View HR Dashboard
          </button>
        </div>
      </motion.div>

      {/* Bottom rule */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        style={{ position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(207,157,123,0.1),transparent)', transformOrigin: 'center' }}
      />
    </div>
  )
}
