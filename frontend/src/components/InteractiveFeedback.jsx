import { motion } from 'framer-motion'

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2L13.5 12H1.5L7.5 2Z" stroke="#CF9D7B" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(207,157,123,0.08)"/>
      <path d="M7.5 6V9M7.5 11V11" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 10L5 6L8 9L12 4L14 6" stroke="#7A9E7E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4H14V7" stroke="#7A9E7E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="#CF9D7B" strokeWidth="1.2"/>
      <circle cx="7.5" cy="7.5" r="3.5" stroke="#CF9D7B" strokeWidth="1.1" opacity="0.5"/>
      <circle cx="7.5" cy="7.5" r="1.2" fill="#CF9D7B"/>
    </svg>
  )
}

export default function InteractiveFeedback({ gapResult }) {
  if (!gapResult) return null

  const { gap_skills, overall_match_percentage } = gapResult
  const toElite = (90 - overall_match_percentage).toFixed(1)
  const top3 = [...gap_skills].sort((a, b) => b.gap_score - a.gap_score).slice(0, 3)

  const priorityColor = {
    critical: '#9E4A3A',
    high: '#CF9D7B',
    medium: '#A08060',
    low: 'rgba(207,157,123,0.45)'
  }
  const estimatedBoost = [8, 6, 4]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Gap breakdown */}
      <div className="autumn-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertIcon /> Skill Gap Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {gap_skills.slice(0, 8).map((gap, i) => (
            <motion.div
              key={gap.skill_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
            >
              <span className="chip-gap" style={{ minWidth: 100 }}>{gap.skill_name}</span>
              <span style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
                color: priorityColor[gap.priority] || 'rgba(207,157,123,0.5)',
                background: `${priorityColor[gap.priority] || '#CF9D7B'}12`,
                border: `1px solid ${priorityColor[gap.priority] || '#CF9D7B'}25`,
                borderRadius: 5, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {gap.priority}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', flex: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                {gap.candidate_level}/10 → {gap.required_level}/10
              </span>
              {gap.priority === 'critical' && (
                <span style={{ fontSize: 11, color: '#9E4A3A', fontWeight: 600 }}>Fix first</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="autumn-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendIcon /> Personalized Improvement Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gap_skills.slice(0, 4).map(gap => (
            <div key={gap.skill_name} style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'rgba(122,158,126,0.05)', border: '1px solid rgba(122,158,126,0.12)',
              fontSize: 13, color: 'rgba(207,157,123,0.6)', lineHeight: 1.6,
            }}>
              <span style={{ color: '#7A9E7E', fontWeight: 600 }}>{gap.skill_name}:</span>
              {' '}Currently {gap.candidate_level}/10, needs {gap.required_level}/10.
              Close the {gap.gap_score}-point gap via your assigned roadmap modules.
              {gap.is_mandatory && <span style={{ color: 'var(--brass)', marginLeft: 6, fontWeight: 600 }}>Required.</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Progress to 90% */}
      <div className="autumn-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#EDE0D0', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TargetIcon /> Progress to Interview Unlock
        </h3>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
              Current: <strong style={{ color: 'var(--brass)' }}>{overall_match_percentage}%</strong>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
              Target: <strong style={{ color: '#EDE0D0' }}>90%</strong>
            </span>
          </div>
          <div className="progress-bar-track" style={{ height: 10, position: 'relative' }}>
            <div className="progress-bar-fill" style={{ width: `${overall_match_percentage}%`, height: 10 }} />
            <div style={{ position: 'absolute', left: '90%', top: -4, bottom: -4, width: 1.5, background: 'rgba(237,224,208,0.5)', borderRadius: 1 }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(207,157,123,0.45)', marginTop: 5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
            Mock Interview unlocks at 90%
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.6)', marginBottom: 14, lineHeight: 1.6 }}>
          You're <strong style={{ color: 'var(--brass)' }}>{toElite} points</strong> away. Closing these top gaps will unlock the interview:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {top3.map((gap, i) => (
            <div key={gap.skill_name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(207,157,123,0.04)', border: '1px solid rgba(207,157,123,0.1)',
            }}>
              <span style={{ color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, minWidth: 20 }}>#{i + 1}</span>
              <span className="chip-gap">{gap.skill_name}</span>
              <span style={{ fontSize: 12, color: 'rgba(207,157,123,0.45)', flex: 1 }}>Close {gap.gap_score} pt gap</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--brass)' }}>
                +~{estimatedBoost[i]}%
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(114,75,57,0.08)', borderRadius: 8, fontSize: 13, color: 'rgba(207,157,123,0.6)', border: '1px solid rgba(114,75,57,0.2)', lineHeight: 1.5 }}>
          At {overall_match_percentage}%, close these 3 gaps to reach 90%+. Your roadmap is already scheduling them.
        </div>
      </div>
    </div>
  )
}
