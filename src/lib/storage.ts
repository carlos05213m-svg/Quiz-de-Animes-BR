import { QuizResult } from '../types';

const STORAGE_KEY = 'anime_quiz_ranks';

export function getRankings(): QuizResult[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveRanking(result: QuizResult) {
  const current = getRankings();
  const next = [...current, result]
    .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
    .slice(0, 50); // Keep top 50, but we display top 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
