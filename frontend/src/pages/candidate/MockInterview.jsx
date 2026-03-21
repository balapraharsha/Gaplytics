import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const QUESTION_TIME = 300

const TYPE_LABELS = {
  scenario_decision: 'Scenario Decision',
  debug_the_code: 'Debug the Code',
  fix_the_code: 'Fix the Code',
  code_review: 'Code Review',
  log_detective: 'Log Detective',
  complexity_analysis: 'Complexity Analysis',
}

function CodeBlock({ code, isLog }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current && code) hljs.highlightElement(ref.current) }, [code])
  if (!code) return null
  return isLog ? (
    <div className="terminal-block" style={{ marginBottom: 16 }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
    </div>
  ) : (
    <pre ref={ref} className="code-block" style={{ marginBottom: 16 }}>
      <code>{code}</code>
    </pre>
  )
}

function Countdown({ onDone }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    if (n <= 0) { onDone(); return }
    const t = setTimeout(() => setN(n - 1), 1000)
    return () => clearTimeout(t)
  }, [n])
  return (
    <motion.div key={n}
      initial={{ scale: 1.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 120, color: '#EDE0D0', textShadow: '0 0 60px rgba(207,157,123,0.3)' }}
    >
      {n}
    </motion.div>
  )
}

async function generateQuestions(gapResult) {
  const res = await axios.post(`${API}/api/interview/generate`, { candidate_context: gapResult })
  return res.data.questions || []
}

export default function MockInterview() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [skipsLeft, setSkipsLeft] = useState(2)
  const [timerData, setTimerData] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('gaplytics_analysis')
    if (!stored) { navigate('/candidate'); return }
    const analysis = JSON.parse(stored)
    generateQuestions(analysis.gap_result)
      .then(qs => { setQuestions(qs); setPhase('countdown') })
      .catch(() => { toast.error('Failed to generate questions'); navigate('/candidate/dashboard') })
  }, [])

  useEffect(() => {
    if (phase !== 'interview') return
    setTimeLeft(QUESTION_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAutoAdvance(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, currentIdx])

  function handleAutoAdvance() { recordAnswer(currentAnswer, QUESTION_TIME, false, true) }

  function recordAnswer(text, timeTaken, wasSkipped, wasTimeout) {
    clearInterval(timerRef.current)
    const q = questions[currentIdx]
    const newAnswer = { question_id: q.id, answer_text: text || '(no answer)', time_taken_seconds: timeTaken, was_skipped: wasSkipped, was_timeout: wasTimeout }
    const newAnswers = [...answers, newAnswer]
    const newTimerData = [...timerData, { question_id: q.id, time_taken_seconds: timeTaken, was_skipped: wasSkipped, was_timeout: wasTimeout }]
    setAnswers(newAnswers); setTimerData(newTimerData); setCurrentAnswer('')
    if (currentIdx + 1 >= questions.length) submitInterview(newAnswers, newTimerData)
    else setCurrentIdx(i => i + 1)
  }

  function handleSubmit() { recordAnswer(currentAnswer, QUESTION_TIME - timeLeft, false, false) }
  function handleSkip() {
    if (skipsLeft <= 0) { toast.error('No skips remaining'); return }
    setSkipsLeft(s => s - 1)
    recordAnswer('', QUESTION_TIME - timeLeft, true, false)
  }

  async function submitInterview(finalAnswers, finalTimerData) {
    setPhase('submitting')
    const stored = localStorage.getItem('gaplytics_analysis')
    const analysis = JSON.parse(stored)
    try {
      const res = await axios.post(`${API}/api/interview/evaluate`, { questions, answers: finalAnswers, candidate_context: analysis.gap_result })
      localStorage.setItem('gaplytics_interview_result', JSON.stringify(res.data))
      localStorage.setItem('gaplytics_interview_questions', JSON.stringify(questions))
      localStorage.setItem('gaplytics_interview_answers', JSON.stringify(finalAnswers))
      navigate('/candidate/results')
    } catch {
      toast.error('Evaluation failed'); navigate('/candidate/dashboard')
    }
  }

  const timerClass = timeLeft > 60 ? 'timer-normal' : timeLeft > 20 ? 'timer-warning' : 'timer-critical'
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  const LoadingScreen = ({ message, sub }) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--chinese-black)', flexDirection: 'column', gap: 16 }}>
      <div className="warm-pulse" style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#EDE0D0' }}>{message}</div>
      <div style={{ color: 'rgba(207,157,123,0.5)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ width: 80, height: 8 }} />)}
      </div>
    </div>
  )

  if (phase === 'loading') return <LoadingScreen message="Preparing your interview…" sub="Generating personalized questions with Gemini AI" />
  if (phase === 'submitting') return <LoadingScreen message="Evaluating your answers…" sub="Gemini AI is analyzing all 9 dimensions" />
  if (phase === 'countdown') return (
    <div style={{ minHeight: '100vh', background: 'var(--chinese-black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 18, color: '#EDE0D0' }}>Interview Starting</div>
      <AnimatePresence mode="wait">
        <Countdown key="cd" onDone={() => setPhase('interview')} />
      </AnimatePresence>
      <div style={{ color: 'rgba(207,157,123,0.45)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}>
        {questions.length} questions · 5 min each · {skipsLeft} skips available
      </div>
    </div>
  )

  if (!questions[currentIdx]) return null
  const q = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--chinese-black)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div className="glass-nav" style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 18, color: '#EDE0D0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="rgba(207,157,123,0.3)" strokeWidth="1.2"/>
            <path d="M10 5V10.5L13 12.5" stroke="#CF9D7B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mock Interview
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(207,157,123,0.5)' }}>
          {currentIdx + 1} / {questions.length}
        </div>
        <div className={timerClass} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18 }}>
          {mins}:{secs}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '14px 0' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s',
            background: i < currentIdx ? '#7A9E7E' : i === currentIdx ? 'var(--brass)' : 'rgba(58,53,52,0.8)',
          }} />
        ))}
      </div>

      {/* Question */}
      <div style={{ flex: 1, maxWidth: 780, margin: '0 auto', width: '100%', padding: '0 20px 24px' }}>
        <motion.div key={currentIdx}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }} className="autumn-card" style={{ padding: 28 }}
        >
          <div style={{ marginBottom: 16 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase',
              background: 'rgba(114,75,57,0.18)', color: 'var(--brass)', border: '1px solid rgba(207,157,123,0.22)',
              borderRadius: 6, padding: '3px 10px',
            }}>
              {TYPE_LABELS[q.question_type] || q.question_type}
            </span>
          </div>

          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 16, color: '#EDE0D0', lineHeight: 1.65, margin: '0 0 20px' }}>
            {q.question_text}
          </p>

          <CodeBlock code={q.code_snippet} isLog={q.question_type === 'log_detective'} />

          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            className="autumn-input"
            placeholder="Write your answer here…"
            rows={8}
            style={{ resize: 'vertical', fontFamily: q.question_type === 'fix_the_code' ? 'JetBrains Mono, monospace' : 'Plus Jakarta Sans, sans-serif', fontSize: 14 }}
            autoFocus
          />
          <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.3)', marginTop: 5, fontFamily: 'JetBrains Mono, monospace' }}>
            {currentAnswer.length} chars
          </div>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={handleSkip} disabled={skipsLeft <= 0}
              style={{
                background: 'rgba(22,33,39,0.8)', border: '1px solid rgba(207,157,123,0.18)',
                color: skipsLeft > 0 ? 'rgba(207,157,123,0.6)' : 'rgba(207,157,123,0.25)', borderRadius: 9,
                padding: '10px 18px', cursor: skipsLeft > 0 ? 'pointer' : 'not-allowed',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, transition: 'all 0.2s',
              }}
            >Skip</button>
            <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
              {skipsLeft} skip{skipsLeft !== 1 ? 's' : ''} left
            </span>
          </div>
          <button onClick={handleSubmit} disabled={currentAnswer.trim().length < 10}
            className={isLast ? 'btn-elite' : 'btn-primary'}
            style={{ padding: '12px 28px', fontSize: 14 }}>
            {isLast ? 'Submit Interview' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  )
}
