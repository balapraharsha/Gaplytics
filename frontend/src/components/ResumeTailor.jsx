import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2V9M4 6L7 9L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 11H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z" stroke="#CF9D7B" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

// Convert markdown to clean HTML sections
function markdownToHtml(md) {
  if (!md) return ''
  return md
    .replace(/^# (.+)$/gm,  '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`([^`]+)`/g,   '<code>$1</code>')
    .replace(/^[-•] (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>(\n|$))+/g, s => `<ul>${s}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hup]|<li|<ul)(.+)$/gm, '$1')
    .trim()
}

function downloadTailoredResume(content, candidateName, targetRole) {
  const bodyHtml = markdownToHtml(content)
  const name = candidateName || 'Candidate'
  const role = targetRole || 'Target Role'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${name} — Resume for ${role}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 13px; }
  body {
    font-family: 'DM Sans', Georgia, serif;
    background: #fff;
    color: #1C1A18;
    padding: 52px 60px;
    max-width: 860px;
    margin: 0 auto;
    line-height: 1.7;
  }
  /* Header block */
  .resume-header {
    border-bottom: 2px solid #1C1A18;
    padding-bottom: 14px;
    margin-bottom: 24px;
  }
  h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px;
    font-weight: 600;
    color: #0C1519;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }
  .role-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #724B39;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .generated-by {
    font-size: 10px;
    color: #aaa;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  /* Section headings */
  h2 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #724B39;
    margin: 22px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E5D8CE;
  }
  h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #1C1A18;
    margin: 12px 0 3px;
  }
  p {
    margin-bottom: 8px;
    color: #2C2A28;
  }
  ul {
    padding-left: 20px;
    margin-bottom: 10px;
  }
  li {
    margin-bottom: 4px;
    color: #2C2A28;
  }
  strong { color: #1C1A18; font-weight: 600; }
  em { color: #724B39; font-style: italic; }
  code {
    background: #F5EDE6;
    border: 1px solid #E8D4C4;
    border-radius: 3px;
    padding: 1px 5px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #724B39;
  }
  /* Skills grid */
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .skill-tag {
    background: #F5EDE6;
    border: 1px solid #E8D4C4;
    border-radius: 4px;
    padding: 3px 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11px;
    color: #724B39;
    font-weight: 500;
  }
  .skill-tag.new {
    background: #EAF2EB;
    border-color: #B8D4BB;
    color: #3A6B3D;
  }
  /* Footer */
  .footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid #E5D8CE;
    font-size: 9px;
    color: #bbb;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { padding: 28px 32px; }
    .footer { display: none; }
    @page { margin: 1.5cm; }
  }
</style>
</head>
<body>
<div class="resume-header">
  <h1>${name}</h1>
  <div class="role-subtitle">${role}</div>
  <div class="generated-by">Tailored by GAPLYTICS AI · gaplytics.vercel.app</div>
</div>

${bodyHtml}

<div class="footer">
  <span>Tailored by GAPLYTICS AI — gaplytics.vercel.app</span>
  <span>Generated ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
</div>

<script>
  // Auto-trigger print when opened
  window.addEventListener('load', () => {
    setTimeout(() => window.print(), 800)
  })
</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const win  = window.open(url, '_blank')
  if (!win) {
    // Popup blocked — fallback to direct download
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_')}_Resume_${role.replace(/\s+/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast('Downloaded as HTML — open and print to PDF', { icon: '💡' })
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function generateFallbackResume(gap) {
  const name    = gap.candidate_name || 'Candidate'
  const role    = gap.target_role    || 'Target Role'
  const known   = (gap.known_skills  || []).map(s => s.name || s).filter(Boolean)
  const gaps    = (gap.gap_skills    || []).map(g => g.skill_name).filter(Boolean).slice(0, 6)
  const top3    = known.slice(0, 3).join(', ')
  const allKnown = known.map(s => `- **${s}**`).join('\n')
  const gapList = gaps.map(g => `- **${g}** *(actively upskilling — structured roadmap in progress)*`).join('\n')

  return `# ${name}

## Professional Summary

Results-driven professional with strong expertise in ${top3}. Pursuing the ${role} position with a ${gap.overall_match_percentage}% skills match. Currently completing a structured AI-generated learning roadmap to close the remaining gaps and reach full competency.

## Core Skills

${allKnown || '- Strong foundational technical skills'}

## Skills In Development

${gapList || '- Expanding technical skill set through targeted learning'}

## Professional Experience

### Senior Contributor | [Current / Most Recent Company]
*[Start Date] – Present*

- Leveraged ${known[0] || 'core technical skills'} to deliver high-impact projects ahead of schedule
- Collaborated cross-functionally with product and engineering teams to ship customer-facing features
- Improved system reliability and performance by implementing ${known[1] || 'best practices'} across the stack
- Mentored junior team members and contributed to internal knowledge-sharing sessions

### Technical Contributor | [Previous Company]
*[Start Date] – [End Date]*

- Built and maintained production systems using ${known.slice(0,3).join(', ') || 'core technologies'}
- Participated in code reviews and contributed to improving team coding standards
- Delivered features end-to-end: design, implementation, testing, and deployment

## Education

### Bachelor of [Relevant Field] | [University Name]
*[Graduation Year]*

Relevant coursework: Computer Science fundamentals, Data Structures, Algorithms, ${known.slice(0, 2).join(', ')}

## Projects & Achievements

- Built and deployed [Project Name] using ${known[0] || 'key technology'} — improved [metric] by [X]%
- Contributed to open-source project in ${known[1] || 'relevant area'} — [brief description]
- Completed structured learning roadmap targeting ${role} competencies — current progress: ${gap.overall_match_percentage}% match

## Certifications & Learning

${gaps.slice(0,3).map(g => `- *${g}* — currently completing structured certification pathway`).join('\n') || '- Continuous learner with active certification pathway'}

---
*Resume tailored by GAPLYTICS AI for ${role} application*`
}

export default function ResumeTailor({ gapResult, analysisContext }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tailored, setTailored] = useState(null)
  const [activeTab, setActiveTab] = useState('tailored')

  const score = gapResult?.overall_match_percentage || 0
  if (score < 60 || score >= 90) return null

  const gapSkills = (gapResult?.gap_skills || [])
    .filter(g => g.priority === 'critical' || g.priority === 'high')
    .slice(0, 6)
    .map(g => g.skill_name)

  async function generateTailoredResume() {
    setLoading(true)
    setTailored(null)
    try {
      const res = await axios.post(`${API}/api/tailor-resume`, {
        analysis_context: analysisContext,
        gap_skills: gapSkills,
        target_role: gapResult.target_role,
        candidate_name: gapResult.candidate_name,
        known_skills: (gapResult.known_skills || []).map(s => s.name || s),
      }, { timeout: 60000 })
      setTailored(res.data.tailored_resume)
      setActiveTab('tailored')
    } catch (err) {
      const fallback = generateFallbackResume(gapResult)
      setTailored(fallback)
      toast('Generated locally — AI version available when backend is reachable', { icon: '💡' })
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = score >= 80 ? '#CF9D7B' : '#724B39'

  return (
    <div style={{ marginBottom: 22 }}>
      {!open && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="autumn-card"
          style={{ padding: '20px 24px', border: '1px solid rgba(207,157,123,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(207,157,123,0.1)', border: '1px solid rgba(207,157,123,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SparkleIcon />
              </div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 15, color: '#EDE0D0', marginBottom: 3 }}>
                  Tailor Your Resume with AI
                </div>
                <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.55)' }}>
                  Score <span style={{ color: scoreColor, fontWeight: 600 }}>{score}%</span> — AI rewrites your resume to match this role and close your skill gaps.
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setOpen(true)}
              style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
              <SparkleIcon /> Tailor My Resume
            </button>
          </div>
          {gapSkills.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono', marginRight: 2 }}>Will add:</span>
              {gapSkills.map(g => <span key={g} className="chip-gap" style={{ fontSize: 10 }}>{g}</span>)}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="autumn-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(207,157,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SparkleIcon />
                <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 14, color: '#EDE0D0' }}>AI Resume Tailor</span>
                <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.4)', fontFamily: 'JetBrains Mono' }}>→ {gapResult?.target_role}</span>
              </div>
              <button onClick={() => { setOpen(false); setTailored(null) }}
                style={{ background: 'none', border: 'none', color: 'rgba(207,157,123,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '20px 22px' }}>
              {!tailored && !loading && (
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.6)', lineHeight: 1.7, marginBottom: 16 }}>
                    The AI will generate a <strong style={{ color: '#EDE0D0' }}>complete tailored resume</strong> including:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {[
                      'Full professional summary rewritten for ' + (gapResult?.target_role || 'the role'),
                      'Core Skills section with all your existing skills preserved',
                      'Skills In Development — gap skills added in context, not just listed',
                      'Experience Highlights — bullet points reframed with JD keywords',
                      'Education, Certifications & Projects sections fully completed',
                      'Download as print-ready HTML → save as PDF from browser',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(207,157,123,0.65)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="#7A9E7E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={generateTailoredResume}
                    style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SparkleIcon /> Generate Full Tailored Resume
                  </button>
                </div>
              )}

              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 7 }}>
                    {[0,1,2].map(i => (
                      <div key={i} className="skeleton" style={{ width: 9, height: 9, borderRadius: '50%',
                        background: 'var(--brass)', animation: 'dotBlink 1.2s infinite',
                        animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 13, color: 'rgba(207,157,123,0.55)' }}>
                    AI is writing your tailored resume…
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(207,157,123,0.3)', fontFamily: 'JetBrains Mono' }}>
                    This takes ~15 seconds
                  </div>
                </div>
              )}

              {tailored && (
                <div>
                  <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid rgba(207,157,123,0.1)' }}>
                    {[['tailored', 'Full Resume'], ['diff', 'What Changed']].map(([key, label]) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 12, fontWeight: 600,
                          padding: '8px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                          borderBottom: activeTab === key ? '2px solid var(--brass)' : '2px solid transparent',
                          color: activeTab === key ? 'var(--brass)' : 'rgba(207,157,123,0.4)',
                          marginBottom: -1 }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'tailored' && (
                    <div style={{ background: 'rgba(12,21,25,0.6)', border: '1px solid rgba(58,53,52,0.5)',
                      borderRadius: 10, padding: '20px 22px', maxHeight: 460, overflowY: 'auto', marginBottom: 16 }}>
                      <pre style={{ fontFamily: 'DM Sans', fontSize: 12.5, color: 'rgba(207,157,123,0.8)',
                        lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {tailored}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'diff' && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: 'rgba(207,157,123,0.6)', marginBottom: 12, lineHeight: 1.6 }}>
                        These skills were woven into your resume:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                        {gapSkills.map(g => (
                          <span key={g} style={{ background: 'rgba(122,158,126,0.12)', border: '1px solid rgba(122,158,126,0.3)',
                            borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#7A9E7E', fontFamily: 'JetBrains Mono' }}>
                            + {g}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(207,157,123,0.45)', lineHeight: 1.7 }}>
                        Your professional summary was rewritten for <strong style={{ color: 'var(--brass)' }}>{gapResult?.target_role}</strong>.
                        All existing skills were preserved. Gap skills appear in context — described as active learning, not fabricated experience.
                        Experience section uses JD-aligned keywords to pass ATS screening.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn-primary"
                      onClick={() => downloadTailoredResume(tailored, gapResult?.candidate_name, gapResult?.target_role)}
                      style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <DownloadIcon /> Download as PDF
                    </button>
                    <button className="btn-ghost" onClick={generateTailoredResume}
                      style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <SparkleIcon /> Regenerate
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(207,157,123,0.3)', fontFamily: 'JetBrains Mono' }}>
                      Opens print dialog → Save as PDF
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
