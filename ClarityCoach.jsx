import React, { useState, useEffect, useRef } from 'react'
import { BackIcon } from '../components/Icons'
import { INITIAL_ELO, calculateExpectedScore, updateElo, getDifficultyRating, eloToCognitiveScore } from '../utils/elo'

const PROMPTS = ['Describe your ideal morning', 'Explain your favorite hobby', 'Tell about a memorable trip', 'Describe your dream home', 'Explain how to make your favorite meal']
const FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally']
const ROUNDS = 3, TIME = 30

export default function ClarityCoach({ onBack, initialRating = INITIAL_ELO, onComplete }) {
  const [view, setView] = useState('instructions')
  const [rating, setRating] = useState(initialRating)
  const [state, setState] = useState('idle')
  const [prompt, setPrompt] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIME)
  const [transcript, setTranscript] = useState('')
  const [fillers, setFillers] = useState(0)
  const [played, setPlayed] = useState(0)
  const [won, setWon] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [supported, setSupported] = useState(true)
  const recRef = useRef(null), timerRef = useRef(null)
  const score = eloToCognitiveScore(rating)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) setSupported(false)
    return () => { if (timerRef.current) clearInterval(timerRef.current); if (recRef.current) try { recRef.current.stop() } catch {} }
  }, [])

  const countFillers = (text) => FILLERS.reduce((c, f) => c + (text.toLowerCase().match(new RegExp(`\\b${f}\\b`, 'gi')) || []).length, 0)

  const startGame = () => { setPlayed(0); setWon(0); setView('game'); setTimeout(startRound, 500) }

  const startRound = () => { setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); setTranscript(''); setFillers(0); setTimeLeft(TIME); setState('ready'); setFeedback(null) }

  const beginSpeaking = () => {
    setState('speaking')
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { stopSpeaking(); return 0 } return t - 1 }), 1000)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recRef.current = new SR()
    recRef.current.continuous = true
    recRef.current.interimResults = true
    recRef.current.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript
      setTranscript(full)
      setFillers(countFillers(full))
    }
    recRef.current.start()
  }

  const stopSpeaking = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (recRef.current) try { recRef.current.stop() } catch {}
    endRound()
  }

  const endRound = () => {
    setState('feedback')
    const words = transcript.split(/\s+/).filter(w => w).length
    const rate = words > 0 ? fillers / words : 1
    const success = rate < 0.05 && words >= 20
    const level = Math.max(1, Math.floor((rating - 800) / 100))
    const diff = getDifficultyRating(level), exp = calculateExpectedScore(rating, diff)
    const newRating = updateElo(rating, exp, success ? 1 : 0)
    setRating(newRating); setPlayed(p => p + 1); if (success) setWon(w => w + 1)
    setFeedback({ won: success, change: newRating - rating, words, fillers })
  }

  const nextRound = () => { if (played >= ROUNDS) { setView('summary'); onComplete?.({ gameId: 'clarity', rating, roundsWon: won, roundsPlayed: ROUNDS }) } else startRound() }

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 },
    header: { width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 12, cursor: 'pointer', display: 'flex' },
    title: { fontSize: '1.5rem', fontWeight: 600 },
    scoreBadge: { background: 'rgba(52,211,153,0.2)', borderRadius: 12, padding: '8px 16px', fontSize: '0.9rem', color: '#34d399' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 },
    btn: { background: 'linear-gradient(135deg, #34d399, #10b981)', border: 'none', borderRadius: 16, padding: '16px 48px', color: '#000', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' },
    stopBtn: { background: 'linear-gradient(135deg, #f87171, #ef4444)' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360, width: '100%' },
    promptCard: { background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, textAlign: 'center', marginBottom: 32, width: '100%' },
    timer: { width: 120, height: 120, borderRadius: '50%', border: '4px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    transcriptBox: { background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, width: '100%', minHeight: 100, maxHeight: 150, overflow: 'auto', marginBottom: 24 },
  }

  if (!supported) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Clarity Coach</h1><div style={{ width: 48 }} /></div>
        <div style={styles.content}>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎙️</div>
            <h2 style={{ marginBottom: 16 }}>Speech Recognition Unavailable</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Try Chrome, Edge, or Safari.</p>
            <button style={styles.btn} onClick={onBack}>Back to Hub</button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'instructions') {
    return (
      <div style={styles.container}>
        <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Clarity Coach</h1><div style={{ width: 48 }} /></div>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>How to Play</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.6 }}>🎯 Speak for 30 seconds without filler words (um, uh, like...)</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>💡 Pause silently instead of using fillers!</p>
            <button style={styles.btn} onClick={startGame}>Begin Training</button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'summary') {
    const winRate = Math.round((won / ROUNDS) * 100)
    return (
      <div style={styles.container}>
        <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Complete!</h1><div style={{ width: 48 }} /></div>
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎙️</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{winRate >= 67 ? 'Excellent!' : winRate >= 34 ? 'Good effort!' : 'Keep practicing!'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{won} of {ROUNDS} rounds</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
              <div><div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>{winRate}%</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Success</div></div>
              <div><div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa' }}>{score}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Score</div></div>
            </div>
            <button style={styles.btn} onClick={onBack}>Back to Hub</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Clarity Coach</h1><div style={styles.scoreBadge}>{score}</div></div>
      <div style={styles.content}>
        {state === 'feedback' && feedback ? (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16, color: feedback.won ? '#34d399' : '#f87171' }}>{feedback.won ? 'Clear Speech!' : 'Too Many Fillers'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{feedback.words}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Words</div></div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: '1.5rem', fontWeight: 700, color: feedback.fillers > 2 ? '#f87171' : '#34d399' }}>{feedback.fillers}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Fillers</div></div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 24, color: feedback.change > 0 ? '#34d399' : '#f87171' }}>{feedback.change > 0 ? '+' : ''}{feedback.change} rating</div>
            <button style={styles.btn} onClick={nextRound}>{played >= ROUNDS ? 'See Results' : 'Next'}</button>
          </div>
        ) : (
          <>
            <div style={styles.promptCard}><p style={{ fontSize: '1.3rem', fontWeight: 500, lineHeight: 1.5 }}>{prompt}</p></div>
            {state === 'speaking' && (
              <>
                <div style={styles.timer}><span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#34d399' }}>{timeLeft}</span></div>
                <div style={styles.transcriptBox}><p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.95rem', textAlign: 'left' }}>{transcript || 'Start speaking...'}</p></div>
                {fillers > 0 && <div style={{ color: '#fbbf24', marginBottom: 24, fontSize: '0.95rem' }}>Fillers: {fillers}</div>}
                <button style={{ ...styles.btn, ...styles.stopBtn }} onClick={stopSpeaking}>Stop Early</button>
              </>
            )}
            {state === 'ready' && <button style={styles.btn} onClick={beginSpeaking}>Start Speaking</button>}
          </>
        )}
      </div>
    </div>
  )
}
