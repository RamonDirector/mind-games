import React, { useState, useCallback } from 'react'
import { BackIcon } from '../components/Icons'
import { INITIAL_ELO, calculateExpectedScore, updateElo, getDifficultyRating, eloToCognitiveScore, getStartingLevel } from '../utils/elo'

const ROUNDS = 5

export default function PatternRecall({ onBack, initialRating = INITIAL_ELO, onComplete }) {
  const [view, setView] = useState('instructions')
  const [rating, setRating] = useState(initialRating)
  const [state, setState] = useState('idle')
  const [sequence, setSequence] = useState([])
  const [userSeq, setUserSeq] = useState([])
  const [level, setLevel] = useState(1)
  const [activeCell, setActiveCell] = useState(null)
  const [showingIdx, setShowingIdx] = useState(-1)
  const [feedback, setFeedback] = useState(null)
  const [played, setPlayed] = useState(0)
  const [won, setWon] = useState(0)

  const score = eloToCognitiveScore(rating)

  const genSeq = useCallback((len) => Array.from({ length: len }, () => Math.floor(Math.random() * 9)), [])

  const startGame = () => {
    const lvl = getStartingLevel(rating)
    setLevel(lvl)
    setPlayed(0)
    setWon(0)
    setView('game')
    setTimeout(() => startRound(lvl), 500)
  }

  const startRound = (lvl) => {
    const seq = genSeq(lvl + 2)
    setSequence(seq)
    setUserSeq([])
    setState('showing')
    setFeedback(null)
    let i = 0
    const interval = setInterval(() => {
      if (i < seq.length) {
        setShowingIdx(seq[i])
        setTimeout(() => setShowingIdx(-1), 400)
        i++
      } else {
        clearInterval(interval)
        setState('input')
      }
    }, 600)
  }

  const handleClick = (idx) => {
    if (state !== 'input') return
    setActiveCell(idx)
    setTimeout(() => setActiveCell(null), 150)
    const newSeq = [...userSeq, idx]
    setUserSeq(newSeq)
    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) return endRound(false)
    if (newSeq.length === sequence.length) endRound(true)
  }

  const endRound = (success) => {
    setState('feedback')
    const diff = getDifficultyRating(level)
    const exp = calculateExpectedScore(rating, diff)
    const newRating = updateElo(rating, exp, success ? 1 : 0)
    setRating(newRating)
    setPlayed(p => p + 1)
    if (success) setWon(w => w + 1)
    setFeedback({ won: success, change: newRating - rating })
    setLevel(l => success ? l + 1 : Math.max(1, l - 1))
  }

  const nextRound = () => {
    if (played >= ROUNDS) {
      setView('summary')
      onComplete?.({ gameId: 'pattern', rating, roundsWon: won, roundsPlayed: ROUNDS })
    } else startRound(level)
  }

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 },
    header: { width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 12, cursor: 'pointer', display: 'flex' },
    title: { fontSize: '1.5rem', fontWeight: 600 },
    scoreBadge: { background: 'rgba(167, 139, 250, 0.2)', borderRadius: 12, padding: '8px 16px', fontSize: '0.9rem', color: '#a78bfa' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
    cell: { width: 90, height: 90, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.15s' },
    cellActive: { background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', boxShadow: '0 0 30px rgba(167, 139, 250, 0.6)', border: '2px solid rgba(255,255,255,0.3)' },
    btn: { background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', border: 'none', borderRadius: 16, padding: '16px 48px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360 },
    progress: { display: 'flex', gap: 8, marginBottom: 24 },
    dot: { width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' },
  }

  if (view === 'instructions') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}><BackIcon /></button>
          <h1 style={styles.title}>Pattern Recall</h1>
          <div style={{ width: 48 }} />
        </div>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>How to Play</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.6 }}>🎯 Watch the tiles light up, then tap them in the same order.</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>📈 Longer sequences = harder challenges = more points!</p>
            <button style={styles.btn} onClick={startGame}>Begin Training</button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'summary') {
    const acc = Math.round((won / ROUNDS) * 100)
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}><BackIcon /></button>
          <h1 style={styles.title}>Complete!</h1>
          <div style={{ width: 48 }} />
        </div>
        <div style={styles.content}>
          <div style={styles.card}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{acc >= 80 ? 'Excellent!' : acc >= 60 ? 'Good work!' : 'Keep practicing!'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{won} of {ROUNDS} patterns</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
              <div><div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa' }}>{acc}%</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Accuracy</div></div>
              <div><div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>{score}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Score</div></div>
            </div>
            <button style={styles.btn} onClick={onBack}>Back to Hub</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}><BackIcon /></button>
        <h1 style={styles.title}>Pattern Recall</h1>
        <div style={styles.scoreBadge}>{score}</div>
      </div>
      <div style={styles.content}>
        <div style={styles.progress}>
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} style={{ ...styles.dot, background: i < played ? (i < won ? '#34d399' : '#f87171') : i === played ? '#a78bfa' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
        <div style={{ background: 'rgba(167, 139, 250, 0.2)', borderRadius: 20, padding: '8px 20px', color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600, marginBottom: 32 }}>Level {level} · {level + 2} tiles</div>
        {state === 'showing' && <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Watch the pattern...</div>}
        {state === 'input' && <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Your turn!</div>}
        {state !== 'feedback' && (
          <div style={styles.grid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ ...styles.cell, ...(showingIdx === i || activeCell === i ? styles.cellActive : {}) }} onClick={() => handleClick(i)} />
            ))}
          </div>
        )}
        {state === 'feedback' && feedback && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: feedback.won ? '#34d399' : '#f87171' }}>{feedback.won ? 'Perfect!' : 'Almost!'}</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 24, color: feedback.change > 0 ? '#34d399' : '#f87171' }}>{feedback.change > 0 ? '+' : ''}{feedback.change} rating</div>
            <button style={styles.btn} onClick={nextRound}>{played >= ROUNDS ? 'See Results' : 'Next'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
