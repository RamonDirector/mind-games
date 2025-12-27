import React, { useState, useEffect } from 'react'
import Hub from './components/Hub'
import PatternRecall from './games/PatternRecall'
import TaskSwitcher from './games/TaskSwitcher'
import ClarityCoach from './games/ClarityCoach'
import { getData, updateRating } from './utils/storage'

export default function App() {
  const [view, setView] = useState('hub')
  const [game, setGame] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => { setData(getData()) }, [])

  const selectGame = (id) => { setGame(id); setView('game') }
  const backToHub = () => { setView('hub'); setGame(null); setData(getData()) }
  const onComplete = (result) => { updateRating(result.gameId, result.rating); setData(getData()) }
  const getRating = (id) => data?.ratings?.[id] || 1000

  if (view === 'hub') return <Hub onSelectGame={selectGame} />

  const props = { onBack: backToHub, initialRating: getRating(game), onComplete }
  if (game === 'pattern') return <PatternRecall {...props} />
  if (game === 'switcher') return <TaskSwitcher {...props} />
  if (game === 'clarity') return <ClarityCoach {...props} />

  return <Hub onSelectGame={selectGame} />
}
