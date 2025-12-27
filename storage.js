const STORAGE_KEY = 'mindgames'

const defaultData = {
  ratings: { pattern: 1000, switcher: 1000, clarity: 1000 },
  streak: { current: 0, lastPlayedDate: null },
}

export const getData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData
  } catch {
    return defaultData
  }
}

export const saveData = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export const updateRating = (gameId, newRating) => {
  const data = getData()
  data.ratings[gameId] = newRating
  saveData(data)
}

export const getCombinedScore = () => {
  const { ratings } = getData()
  const avg = Object.values(ratings).reduce((a, b) => a + b, 0) / 3
  return Math.max(0, Math.round((avg - 600) / 4))
}
