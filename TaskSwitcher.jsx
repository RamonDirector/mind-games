import React, { useState, useEffect, useRef } from 'react'
import { BackIcon } from '../components/Icons'
import { INITIAL_ELO, calculateExpectedScore, updateElo, getDifficultyRating, eloToCognitiveScore } from '../utils/elo'

const TRIALS = 8, SWITCH = 4, ROUNDS = 5
const COLORS = ['violet', 'amber'], SHAPES = ['circle', 'square']
const colorMap = { violet: { bg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', shadow: 'rgba(139,92,246,0.6)' }, amber: { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: 'rgba(251,191,36,0.6)' } }

export default function TaskSwitcher({ onBack, initialRating = INITIAL_ELO, onComplete }) {
  const [view, setView] = useState('instructions')
  const [rating, setRating] = useState(initialRating)
  const [level, setLevel] = useState(1)
  const [state, setState] = useState('idle')
  const [rule, setRule] = useState('color')
  const [stim, setStim] = useState(null)
  const [trial, setTrial] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [played, setPlayed] = useState(0)
  const [won, setWon] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [showSwitch, setShowSwitch] = useState(false)
  const timeout = useRef(null)
  const score = eloToCognitiveScore(rating)

  const genStim = () => ({ color: COLORS[Math.floor(Math.random() * 2)], shape: SHAPES[Math.floor(Math.random() * 2)] })

  const startGame = () => { setLevel(Math.max(1, Math.floor((rating - 800) / 100))); setPlayed(0); setWon(0); setView('game'); setTimeout(startRound, 500) }

  const startRound = () => { setTrial(0); setCorrect(0); setRule('color'); setFeedback(null); setState('playing'); nextTrial(0, 'color') }

  const nextTrial = (t, r) => {
    if (t > 0 && t % SWITCH === 0) {
      const newRule = r === 'color' ? 'shape' : 'color'
      setRule(newRule)
      setShowSwitch(true)
      timeout.current = setTimeout(() => { setShowSwitch(false); setStim(genStim()) }, 1200)
    } else setStim(genStim())
  }

  const handleResponse = (res) => {
    if (state !== 'playing' || showSwitch) return
    const isCorrect = rule === 'color' ? res === stim.color : res === stim.shape
    const newTrial = trial + 1, newCorrect = correct + (isCorrect ? 1 : 0)
    setTrial(newTrial); setCorrect(newCorrect)
    if (newTrial >= TRIALS) endRound(newCorrect)
    else nextTrial(newTrial, rule)
  }

  const endRound = (c) => {
    setState('roundEnd')
    const acc = c / TRIALS, success = acc >= 0.75
    const diff = getDifficultyRating(level), exp = calculateExpectedScore(rating, diff)
    const newRating = updateElo(rating, exp, success ? 1 : 0)
    setRating(newRating); setPlayed(p => p + 1); if (success) setWon(w => w + 1)
    setFeedback({ won: success, change: newRating - rating, acc: Math.round(acc * 100), correct: c })
    setLevel(l => success ? l + 1 : Math.max(1, l - 1))
  }

  const nextRound = () => { if (played >= ROUNDS) { setView('summary'); onComplete?.({ gameId: 'switcher', rating, roundsWon: won, roundsPlayed: ROUNDS }) } else startRound() }

  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current) }, [])

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 },
    header: { width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 12, cursor: 'pointer', display: 'flex' },
    title: { fontSize: '1.5rem', fontWeight: 600 },
    scoreBadge: { background: 'rgba(251, 191, 36, 0.2)', borderRadius: 12, padding: '8px 16px', fontSize: '0.9rem', color: '#fbbf24' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 },
    btn: { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', borderRadius: 16, padding: '16px 48px', color: '#000', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360 },
    switchAlert: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.95)', borderRadius: 24, padding: '32px 48px', textAlign: 'center', zIndex: 10, border: '2px solid rgba(251, 191, 36, 0.5)' },
    stimulus: { width: 120, height: 120, marginBottom: 48 },
    respBtns: { display: 'flex', gap: 16, width: '100%', maxWidth: 320 },
    respBtn: { flex: 1, padding: 20, borderRadius: 16, border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: '#fff' },
    progress: { display: 'flex', gap: 6, marginBottom: 24 },
    bar: { width: 28, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)' },
  }

  if (view === 'instructions') {
    return (
      <div style={styles.container}>
        <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Task Switcher</h1><div style={{ width: 48 }} /></div>
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>How to Play</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.6 }}>🎯 Sort by COLOR or SHAPE based on the current rule.</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>🔄 The rule switches every 4 trials. Stay flexible!</p>
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
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔄</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{winRate >= 80 ? 'Excellent!' : winRate >= 60 ? 'Good work!' : 'Keep practicing!'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{won} of {ROUNDS} rounds</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
              <div><div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{winRate}%</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Win Rate</div></div>
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
      <div style={styles.header}><button style={styles.backBtn} onClick={onBack}><BackIcon /></button><h1 style={styles.title}>Task Switcher</h1><div style={styles.scoreBadge}>{score}</div></div>
      <div style={styles.content}>
        {showSwitch && <div style={styles.switchAlert}><div style={{ fontSize: '2rem', marginBottom: 12 }}>🔄</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>RULE SWITCH</div><div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Now sort by {rule.toUpperCase()}</div></div>}
        {state === 'roundEnd' && feedback ? (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: feedback.won ? '#34d399' : '#f87171' }}>{feedback.won ? 'Great!' : 'Try again'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{feedback.correct}/{TRIALS} correct ({feedback.acc}%)</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 24, color: feedback.change > 0 ? '#34d399' : '#f87171' }}>{feedback.change > 0 ? '+' : ''}{feedback.change} rating</div>
            <button style={styles.btn} onClick={nextRound}>{played >= ROUNDS ? 'See Results' : 'Next'}</button>
          </div>
        ) : (
          <>
            <div style={styles.progress}>{Array.from({ length: TRIALS }).map((_, i) => <div key={i} style={{ ...styles.bar, background: i < trial ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />)}</div>
            <div style={{ padding: '12px 24px', borderRadius: 20, marginBottom: 32, background: 'rgba(255,255,255,0.1)', border: '2px solid', borderColor: rule === 'color' ? '#a78bfa' : '#34d399', color: rule === 'color' ? '#a78bfa' : '#34d399', fontWeight: 600 }}>Sort by {rule.toUpperCase()}</div>
            {stim && (
              <>
                <div style={{ ...styles.stimulus, background: colorMap[stim.color].bg, borderRadius: stim.shape === 'circle' ? '50%' : 16, boxShadow: `0 0 30px ${colorMap[stim.color].shadow}` }} />
                <div style={styles.respBtns}>
                  {rule === 'color' ? (
                    <><button style={{ ...styles.respBtn, background: colorMap.violet.bg }} onClick={() => handleResponse('violet')}>Violet</button><button style={{ ...styles.respBtn, background: colorMap.amber.bg, color: '#000' }} onClick={() => handleResponse('amber')}>Amber</button></>
                  ) : (
                    <><button style={{ ...styles.respBtn, background: 'rgba(52,211,153,0.2)', border: '2px solid #34d399' }} onClick={() => handleResponse('circle')}>● Circle</button><button style={{ ...styles.respBtn, background: 'rgba(52,211,153,0.2)', border: '2px solid #34d399' }} onClick={() => handleResponse('square')}>■ Square</button></>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
