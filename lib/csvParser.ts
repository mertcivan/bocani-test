import Papa from 'papaparse';
import { Question, Difficulty, Mode } from '@/types';

interface CSVRow {
  ID: string;
  Category: string;
  SubCategory: string;
  Difficulty: string;
  Mode: string;
  Question_Text: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D: string;
  Option_E: string;
  Correct_Answer: string;
  Solution_Text: string;
  Image_URL?: string;
}

// Server-side only: Parse CSV from file content
export async function parseCSVContent(csvContent: string): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const questions: Question[] = results.data.map((row) => ({
          id: row.ID,
          category: row.Category,
          subCategory: row.SubCategory,
          difficulty: row.Difficulty as Difficulty,
          mode: row.Mode as Mode,
          questionText: row.Question_Text,
          optionA: row.Option_A,
          optionB: row.Option_B,
          optionC: row.Option_C,
          optionD: row.Option_D,
          optionE: row.Option_E,
          correctAnswer: row.Correct_Answer,
          solutionText: row.Solution_Text,
          imageUrl: row.Image_URL || undefined,
        }));
        resolve(questions);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

// Client-side: Fetch questions from API
export async function fetchQuestions(): Promise<Question[]> {
  const response = await fetch('/api/questions');
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
}

export function filterQuestions(
  questions: Question[],
  filters: {
    subCategory?: string;
    difficulty?: Difficulty;
    mode?: Mode;
  }
): Question[] {
  return questions.filter((q) => {
    if (filters.subCategory && q.subCategory !== filters.subCategory) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.mode && q.mode !== filters.mode) return false;
    return true;
  });
}

export function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getUniqueValues<T>(questions: Question[], key: keyof Question): T[] {
  const values = questions.map((q) => q[key]) as T[];
  return Array.from(new Set(values));
}

export function getQuestionsByIds(questions: Question[], ids: string[]): Question[] {
  const idSet = new Set(ids);
  return questions.filter((q) => idSet.has(q.id));
}
