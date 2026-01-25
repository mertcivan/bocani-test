import { Question, UserAnswer, ExamResults } from '@/types';

export function calculateResults(
  questions: Question[],
  answers: Map<string, UserAnswer>
): ExamResults {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;

  const breakdown: { [key: string]: { correct: number; total: number } } = {};

  questions.forEach((question) => {
    const answer = answers.get(question.id);
    const subCategory = question.subCategory;

    if (!breakdown[subCategory]) {
      breakdown[subCategory] = { correct: 0, total: 0 };
    }
    breakdown[subCategory].total++;

    if (!answer) {
      unansweredQuestions++;
    } else if (answer.isCorrect) {
      correctAnswers++;
      breakdown[subCategory].correct++;
    } else {
      incorrectAnswers++;
    }
  });

  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    score: Math.round(score * 10) / 10,
    timeTaken: 0,
    breakdown,
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getQuestionStatus(
  questionId: string,
  answers: Map<string, UserAnswer>
): 'answered' | 'flagged' | 'unanswered' {
  const answer = answers.get(questionId);
  if (!answer) return 'unanswered';
  if (answer.isFlagged) return 'flagged';
  return 'answered';
}

export function saveSessionToLocalStorage(
  sessionId: string,
  data: {
    questions: Question[];
    answers: Map<string, UserAnswer>;
    startTime: Date;
    mode: 'practice' | 'mock';
  }
): void {
  try {
    const serialized = {
      questions: data.questions,
      answers: Array.from(data.answers.entries()),
      startTime: data.startTime.toISOString(),
      mode: data.mode,
    };
    localStorage.setItem(`exam-session-${sessionId}`, JSON.stringify(serialized));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export function loadSessionFromLocalStorage(sessionId: string): {
  questions: Question[];
  answers: Map<string, UserAnswer>;
  startTime: Date;
  mode: 'practice' | 'mock';
} | null {
  try {
    const data = localStorage.getItem(`exam-session-${sessionId}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      questions: parsed.questions,
      answers: new Map(parsed.answers),
      startTime: new Date(parsed.startTime),
      mode: parsed.mode,
    };
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
}

export function clearSession(sessionId: string): void {
  try {
    localStorage.removeItem(`exam-session-${sessionId}`);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
