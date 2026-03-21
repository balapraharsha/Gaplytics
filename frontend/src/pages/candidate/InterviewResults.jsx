import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import Navbar from '../../components/Navbar'

const DIMENSION_LABELS = {
  decision_making: 'Decision Making',
  debugging_ability: 'Debugging',
  code_correctness: 'Code Correctness',
  code_quality: 'Code Quality',
  incident_diagnosis: 'Incident Diagnosis',
  algorithmic_thinking: 'Algorithmic Thinking',
  communication_clarity: 'Communication',
  adaptability_under_pressure: 'Adaptability',
  technical_depth: 'Technical Depth',
}

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = value; const dur = 1400
    const step = (end / dur) * 16
    const t = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(parseFloat(start.toFixed(1)))
      if (start >= end) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <>{display}</>
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <path d="M3 5L7 9L11 5" stroke="rgba(207,157,123,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function InterviewResults() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const ev = localStorage.getItem('gaplytics_interview_result')
    const qs = localStorage.getItem('gaplytics_interview_questions')
    const as = localStorage.getItem('gaplytics_interview_answers')
    if (!ev) { navigate('/candidate/dashboard'); return }
    setEvaluation(JSON.parse(ev))
    setQuestions(JSON.parse(qs || '[]'))
    setAnswers(JSON.parse(as || '[]'))
  }, [])

  if (!evaluation) return null

  const { dimension_scores, overall_score, verdict, per_question_feedback } = evaluation

  const radarData = dimension_scores.map(d => ({
    dimension: DIMENSION_LABELS[d.dimension] || d.dimension,
    score: d.score, fullMark: 10,
  }))

  const verdictConfig = {
    HIRE_READY: { label: 'HIRE READY', color: '#EDE0D0', bg: 'rgba(237,224,208,0.08)', border: 'rgba(237,224,208,0.25)' },
    STRONG_CANDIDATE: { label: 'STRONG CANDIDATE', color: '#CF9D7B', bg: 'rgba(207,157,123,0.08)', border: 'rgba(207,157,123,0.25)' },
    NEEDS_MORE_PREP: { label: 'NEEDS MORE PREP', color: '#9E6A5A', bg: 'rgba(158,106,90,0.08)', border: 'rgba(158,106,90,0.25)' },
  }[verdict] || { label: verdict, color: 'var(--brass)', bg: 'transparent', border: 'transparent' }

  const feedbackMap = {}
  per_question_feedback.forEach(f => { feedbackMap[f.question_id] = f })

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 20px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 16, color: 'rgba(207,157,123,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 }}>
            Interview Complete
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 96, color: verdictConfig.color, textShadow: `0 0 50px ${verdictConfig.color}30`, lineHeight: 1, letterSpacing: '-3px' }}>
            <AnimatedCounter value={overall_score} />
            <span style={{ fontSize: 40, color: 'rgba(207,157,123,0.3)', fontWeight: 300 }}>/10</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: 12,
              color: verdictConfig.color, background: verdictConfig.bg,
              border: `1px solid ${verdictConfig.border}`, borderRadius: 20,
              padding: '7px 18px', letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              {verdictConfig.label}
            </span>
          </div>
        </motion.div>

        {/* Radar + Dimension scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20, marginBottom: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="autumn-card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#EDE0D0', marginBottom: 16 }}>Performance Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(207,157,123,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'rgba(207,157,123,0.5)', fontSize: 10, fontFamily: 'DM Sans' }} />
                <Radar name="Score" dataKey="score" stroke="#CF9D7B" fill="rgba(207,157,123,0.15)" strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {dimension_scores.map((d, i) => (
              <motion.div key={d.dimension}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 + 0.15 }}
                className="autumn-card"
                style={{ padding: '11px 16px', borderColor: d.is_strength ? 'rgba(122,158,126,0.25)' : 'rgba(207,157,123,0.12)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 600, color: d.is_strength ? '#7A9E7E' : 'rgba(207,157,123,0.7)' }}>
                      {DIMENSION_LABELS[d.dimension]}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.45)', marginTop: 2, lineHeight: 1.4 }}>{d.feedback}</div>
                    <div className="progress-bar-track" style={{ height: 3, marginTop: 7 }}>
                      <div style={{
                        height: 3, borderRadius: 100, width: `${d.score * 10}%`,
                        background: d.is_strength ? 'linear-gradient(90deg,#4a7c59,#7A9E7E)' : 'linear-gradient(90deg,var(--coffee),var(--brass))',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 20, color: d.is_strength ? '#7A9E7E' : 'var(--brass)', minWidth: 40, textAlign: 'right' }}>
                    {d.score}<span style={{ fontSize: 11, color: 'rgba(207,157,123,0.35)' }}>/10</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Per-question breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="autumn-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(207,157,123,0.1)' }}>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#EDE0D0' }}>Per-Question Breakdown</span>
          </div>
          {questions.map((q, i) => {
            const a = answers.find(ans => ans.question_id === q.id)
            const fb = feedbackMap[q.id]
            const isExp = expanded === i
            return (
              <div key={q.id} style={{ borderBottom: i < questions.length - 1 ? '1px solid rgba(207,157,123,0.07)' : 'none' }}>
                <button onClick={() => setExpanded(isExp ? null : i)}
                  style={{ width: '100%', padding: '13px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '1px',
                    color: 'var(--brass)', background: 'rgba(207,157,123,0.1)', padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase',
                  }}>Q{i + 1}</span>
                  <span style={{ fontSize: 13, color: '#EDE0D0', flex: 1, textAlign: 'left', lineHeight: 1.4 }}>
                    {q.question_text.slice(0, 80)}{q.question_text.length > 80 ? '…' : ''}
                  </span>
                  {a?.was_skipped && <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>skipped</span>}
                  <ChevronIcon open={isExp} />
                </button>
                {isExp && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0 22px 18px' }}>
                    {a?.answer_text && a.answer_text !== '(no answer)' && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Answer</div>
                        <div style={{ padding: '10px 14px', background: 'rgba(22,33,39,0.8)', borderRadius: 8, fontSize: 13, color: 'rgba(207,157,123,0.7)', lineHeight: 1.55, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', borderLeft: '2px solid rgba(207,157,123,0.2)' }}>
                          {a.answer_text}
                        </div>
                      </div>
                    )}
                    {fb && (
                      <>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(207,157,123,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Feedback</div>
                          <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.6)', lineHeight: 1.6 }}>{fb.feedback}</div>
                        </div>
                        {fb.ideal_answer && (
                          <div>
                            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(122,158,126,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ideal Answer</div>
                            <div style={{ fontSize: 13, color: '#7A9E7E', lineHeight: 1.6, fontStyle: 'italic' }}>{fb.ideal_answer}</div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )
          })}
        </motion.div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9V11C2 11.6 2.4 12 3 12H11C11.6 12 12 11.6 12 11V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M7 2V8M4 5L7 8L10 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download Report
          </button>
          <button className="btn-ghost" onClick={() => navigate('/candidate/roadmap')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3L5 2L9 3.5L12 2V11L9 12L5 10.5L2 12V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 2V10.5M9 3.5V12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/></svg>
            Back to Roadmap
          </button>
        </div>
      </div>
      <style>{`@media print { .glass-nav { display: none; } }`}</style>
    </div>
  )
}
