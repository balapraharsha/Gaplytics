import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CHIPS = [
  'How can I reach 90% faster?',
  'What should I study today?',
  'Explain my biggest gap',
  'How long will my roadmap take?',
]

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M20 14C20 15.1 19.1 16 18 16H6L2 20V4C2 2.9 2.9 2 4 2H18C19.1 2 20 2.9 20 4V14Z" stroke="#EDE0D0" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 8H15M7 11H12" stroke="#EDE0D0" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4L12 12" stroke="rgba(207,157,123,0.6)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 8H2M9 3L14 8L9 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ChatCoach({ analysisContext }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello! I'm your Gaplytics AI Coach, powered by Gemini. I know your skill gaps and roadmap. Ask me anything about your learning journey.` }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text) {
    if (!text.trim()) return
    const userMsg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTyping(true)
    try {
      const res = await axios.post(`${API}/api/chat`, {
        message: userMsg,
        analysis_context: analysisContext,
      })
      const aiText = res.data.response || res.data.message || 'I can help you with that!'
      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble connecting. Please try again.' }])
    } finally { setTyping(false) }
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--coffee), var(--brass))',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(114,75,57,0.4)',
        }}
      >
        <MessageIcon />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            style={{
              position: 'fixed', bottom: 90, right: 28, zIndex: 50,
              width: 340, height: 480,
              background: 'rgba(12,21,25,0.96)',
              border: '1px solid rgba(207,157,123,0.2)',
              borderRadius: 16, overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(207,157,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brass)', boxShadow: '0 0 8px rgba(207,157,123,0.5)' }} />
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#EDE0D0' }}>AI Coach</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '9px 13px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? 'linear-gradient(135deg, var(--coffee), var(--brass))' : 'rgba(22,33,39,0.9)',
                    border: m.role === 'ai' ? '1px solid rgba(207,157,123,0.12)' : 'none',
                    color: m.role === 'user' ? 'var(--chinese-black)' : '#EDE0D0',
                    fontSize: 13, lineHeight: 1.5, fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
                  {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brass)', display: 'inline-block' }} />)}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {messages.length <= 1 && (
              <div style={{ padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid rgba(207,157,123,0.07)' }}>
                {CHIPS.map(chip => (
                  <button key={chip} onClick={() => sendMessage(chip)}
                    style={{
                      background: 'rgba(114,75,57,0.12)', border: '1px solid rgba(207,157,123,0.15)',
                      borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'rgba(207,157,123,0.65)',
                      cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s',
                    }}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(207,157,123,0.1)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask your coach…"
                style={{
                  flex: 1, background: 'rgba(22,33,39,0.8)', border: '1px solid rgba(207,157,123,0.15)',
                  borderRadius: 9, padding: '8px 12px', color: '#EDE0D0', fontSize: 13,
                  fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none',
                }}
              />
              <button onClick={() => sendMessage(input)}
                style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'linear-gradient(135deg, var(--coffee), var(--brass))',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--chinese-black)',
                }}>
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
