import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MockInterview from './MockInterview'

export default function AuthorizedInterview() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('gaplytics_analysis')
    if (!stored) { navigate('/candidate'); return }
    const data = JSON.parse(stored)
    const score = data?.gap_result?.overall_match_percentage || 0
    if (score < 90) {
      navigate('/candidate/dashboard')
    } else {
      setAuthorized(true)
    }
  }, [])

  if (!authorized) return null
  return <MockInterview />
}
