export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  backgroundImage?: string;
  coverImage?: string;
}

export interface QuizResult {
  userId: string;
  userName: string;
  animeId: string;
  animeTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  stars: number;
  timestamp: number;
}

export type Tab = 'quizzes' | 'ranking';
