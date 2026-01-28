import { getSupabase } from './client';
import { Question, UserAnswer, ExamResults } from '@/types';

export interface UserStats {
  id: string;
  user_id: string;
  exam_id: string;
  exam_type: 'practice' | 'mock';
  questions: Question[];
  wrong_answers: string[];
  category_scores: Record<string, { correct: number; total: number }>;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_taken: number | null;
  completed_at: string;
}

// Save exam results to database
export async function saveExamResults(
  userId: string,
  examId: string,
  examType: 'practice' | 'mock',
  questions: Question[],
  answers: Map<string, UserAnswer>,
  results: ExamResults,
  timeTaken?: number
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client not available');

  // Get wrong answers
  const wrongAnswers: string[] = [];
  answers.forEach((answer, questionId) => {
    if (!answer.isCorrect) {
      wrongAnswers.push(questionId);
    }
  });

  const { data, error } = await (supabase
    .from('user_stats') as any)
    .insert({
      user_id: userId,
      exam_id: examId,
      exam_type: examType,
      questions: questions,
      wrong_answers: wrongAnswers,
      category_scores: results.breakdown,
      total_questions: results.totalQuestions,
      correct_answers: results.correctAnswers,
      score: results.score,
      time_taken: timeTaken || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Award points based on performance
  const pointsEarned = calculatePoints(results.score, examType);
  await updateUserPoints(userId, pointsEarned);

  return data;
}

// Calculate points based on score
function calculatePoints(score: number, examType: 'practice' | 'mock'): number {
  const basePoints = examType === 'mock' ? 50 : 10;

  if (score >= 90) return basePoints * 3;
  if (score >= 80) return basePoints * 2;
  if (score >= 70) return basePoints * 1.5;
  if (score >= 60) return basePoints;
  return Math.floor(basePoints * 0.5);
}

// Update user points
async function updateUserPoints(userId: string, points: number) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('points')
    .eq('id', userId)
    .single();

  if (profile) {
    await (supabase
      .from('profiles') as any)
      .update({ points: (profile.points || 0) + points })
      .eq('id', userId);
  }
}

// Get user's exam history
export async function getUserExamHistory(userId: string, limit = 10) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await (supabase
    .from('user_stats') as any)
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Get user stats summary
export async function getUserStatsSummary(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await (supabase as any)
    .rpc('get_user_stats_summary', { p_user_id: userId });

  if (error) {
    console.error('Error fetching stats summary:', error);
    // Fallback: calculate manually
    return calculateStatsSummary(userId);
  }

  return data[0];
}

// Fallback function to calculate stats manually
async function calculateStatsSummary(userId: string) {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      total_exams: 0,
      avg_score: 0,
      total_questions: 0,
      total_correct: 0,
      accuracy: 0,
    };
  }

  const { data: stats } = await (supabase
    .from('user_stats') as any)
    .select('*')
    .eq('user_id', userId);

  if (!stats || stats.length === 0) {
    return {
      total_exams: 0,
      avg_score: 0,
      total_questions: 0,
      total_correct: 0,
      accuracy: 0,
    };
  }

  const totalExams = stats.length;
  const totalQuestions = stats.reduce((sum: number, s: any) => sum + s.total_questions, 0);
  const totalCorrect = stats.reduce((sum: number, s: any) => sum + s.correct_answers, 0);
  const avgScore = stats.reduce((sum: number, s: any) => sum + s.score, 0) / totalExams;
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return {
    total_exams: totalExams,
    avg_score: Math.round(avgScore * 10) / 10,
    total_questions: totalQuestions,
    total_correct: totalCorrect,
    accuracy: Math.round(accuracy * 10) / 10,
  };
}

// Get category performance
export async function getCategoryPerformance(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data: stats } = await (supabase
    .from('user_stats') as any)
    .select('category_scores')
    .eq('user_id', userId);

  if (!stats) return {};

  const categoryTotals: Record<string, { correct: number; total: number }> = {};

  stats.forEach((stat: any) => {
    const scores = stat.category_scores as Record<string, { correct: number; total: number }>;
    Object.entries(scores).forEach(([category, data]) => {
      if (!categoryTotals[category]) {
        categoryTotals[category] = { correct: 0, total: 0 };
      }
      categoryTotals[category].correct += data.correct;
      categoryTotals[category].total += data.total;
    });
  });

  return categoryTotals;
}

// Get weak areas (categories with low accuracy)
export async function getWeakAreas(userId: string, threshold = 60) {
  const categoryPerformance = await getCategoryPerformance(userId);

  const weakAreas = Object.entries(categoryPerformance)
    .map(([category, data]) => ({
      category,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      questionsAttempted: data.total,
    }))
    .filter((area) => area.accuracy < threshold && area.questionsAttempted >= 5)
    .sort((a, b) => a.accuracy - b.accuracy);

  return weakAreas;
}

// Get all unique wrong answer question IDs across user's history
export async function getUserWrongAnswerIds(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await (supabase
    .from('user_stats') as any)
    .select('wrong_answers')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wrong answers:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const allWrongIds = new Set<string>();
  data.forEach((stat: any) => {
    if (stat.wrong_answers && Array.isArray(stat.wrong_answers)) {
      stat.wrong_answers.forEach((id: string) => allWrongIds.add(id));
    }
  });

  return Array.from(allWrongIds);
}

// Get exam by ID
export async function getExamById(examId: string): Promise<UserStats | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await (supabase
    .from('user_stats') as any)
    .select('*')
    .eq('exam_id', examId)
    .single();

  if (error) {
    console.error('Error fetching exam:', error);
    return null;
  }
  return data as UserStats;
}
