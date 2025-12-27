import React, { useState, useEffect } from 'react'
import { PatternIcon, SwitcherIcon, ClarityIcon, FlameIcon, ChevronIcon } from './Icons'
import { getData, getCombinedScore } from '../utils/storage'
import { eloToCognitiveScore, getPerformanceTier } from '../utils/elo'

const GAMES = [
  { id: 'pattern', name: 'Pattern Recall', domain: 'Working Memory', description: 'Observe sequences and replicate them', color: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', Icon: PatternIcon },
  { id: 'switcher', name: 'Task Switcher', domain: 'Cognitive Flexibility', description: 'Adapt as rules shift mid-challenge', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', Icon: SwitcherIcon },
  { id: 'clarity', name: 'Clarity Coach', domain: 'Verbal Fluency', description: 'Speak without filler words', color: '#34d399', gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', Icon: ClarityIcon },
]

export default function Hub({ onSelectGame }) {
  const [data, setData] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => { setData(getData()) }, [])

  const score = data ? getCombinedScore() : 0
  const tier = getPerformanceTier(score)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', padding: 24 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeUp 0.6s ease-out' }}>
          <div style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Mind Games</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Train your cognitive edge</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 24, marginBottom: 32, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '2px solid rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>{score}</span>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 4 }}>Cognitive Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{tier}</div>
            </div>
          </div>
          {data?.streak?.current > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(251, 191, 36, 0.15)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <FlameIcon size={18} />
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>{data.streak.current}</span>
            </div>
          )}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Training Modules</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {GAMES.map((game) => {
            const gameScore = eloToCognitiveScore(data?.ratings?.[game.id] || 1000)
            const isHovered = hovered === game.id
            return (
              <div
                key={game.id}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.3s', transform: isHovered ? 'translateY(-2px)' : 'none', boxShadow: isHovered ? `0 8px 32px ${game.color}40` : 'none' }}
                onMouseEnter={() => setHovered(game.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectGame(game.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: game.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <game.Icon size={24} color="#fff" />
                  </div>
                  <div style={{ flex: 1, marginLeft: 16 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{game.name}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: game.color }}>{game.domain}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem', color: game.color, fontWeight: 600 }}>{gameScore}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 16 }}>{game.description}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: game.color, fontSize: '0.9rem', fontWeight: 500 }}>Play <ChevronIcon size={16} color={game.color} /></div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Built for cognitive enhancement</div>
      </div>
    </div>
  )
}
