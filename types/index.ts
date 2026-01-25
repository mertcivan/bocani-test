export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Mode = 'Practice' | 'Mock';
export type QuestionStatus = 'unanswered' | 'answered' | 'flagged';

export interface Question {
  id: string;
  category: string;
  subCategory: string;
  difficulty: Difficulty;
  mode: Mode;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  solutionText: string;
  imageUrl?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTaken?: number;
  isFlagged?: boolean;
}

export interface ExamSession {
  questions: Question[];
  answers: Map<string, UserAnswer>;
  startTime: Date;
  endTime?: Date;
  mode: 'practice' | 'mock';
  filters?: {
    subCategory?: string;
    difficulty?: Difficulty;
  };
}

export interface ExamResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  timeTaken: number;
  breakdown: {
    [key: string]: {
      correct: number;
      total: number;
    };
  };
}

export interface DashboardStats {
  totalQuestionsSolved: number;
  accuracy: number;
  bySubCategory: {
    [key: string]: {
      solved: number;
      correct: number;
      accuracy: number;
    };
  };
  byDifficulty: {
    [key: string]: {
      solved: number;
      correct: number;
      accuracy: number;
    };
  };
  recentSessions: {
    date: string;
    mode: string;
    score: number;
    totalQuestions: number;
  }[];
}
