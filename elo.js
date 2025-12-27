export const INITIAL_ELO = 1000
export const K_FACTOR = 32

export const calculateExpectedScore = (playerRating, challengeRating) => 
  1 / (1 + Math.pow(10, (challengeRating - playerRating) / 400))

export const updateElo = (rating, expected, actual) => 
  Math.round(rating + K_FACTOR * (actual - expected))

export const getDifficultyRating = (level) => 800 + (level * 100)

export const eloToCognitiveScore = (elo) => Math.max(0, Math.round((elo - 600) / 4))

export const getStartingLevel = (elo) => Math.max(1, Math.floor((elo - 800) / 100))

export const getPerformanceTier = (score) => {
  if (score >= 120) return 'Elite'
  if (score >= 100) return 'Expert'
  if (score >= 80) return 'Advanced'
  if (score >= 60) return 'Proficient'
  if (score >= 40) return 'Developing'
  return 'Beginner'
}
