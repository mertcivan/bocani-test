'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer } from '@/types';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { QuestionNavigator } from './QuestionNavigator';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveSessionToLocalStorage, calculateResults } from '@/lib/examUtils';
import { useAuth } from './AuthProvider';
import { saveExamResults } from '@/lib/supabase/stats';

interface ExamEngineProps {
  questions: Question[];
  mode: 'practice' | 'mock';
  sessionId: string;
  showSolutionsImmediately?: boolean;
  timerDuration?: number;
}

export function ExamEngine({
  questions,
  mode,
  sessionId,
  showSolutionsImmediately = false,
  timerDuration,
}: ExamEngineProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [startTime] = useState(new Date());

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    // Auto-save session
    const interval = setInterval(() => {
      saveSessionToLocalStorage(sessionId, {
        questions,
        answers,
        startTime,
        mode,
      });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [answers, questions, startTime, mode, sessionId]);

  const handleAnswerSelect = (answer: string) => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    const newAnswers = new Map(answers);

    newAnswers.set(currentQuestion.id, {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeTaken: Math.floor((Date.now() - startTime.getTime()) / 1000),
      isFlagged: answers.get(currentQuestion.id)?.isFlagged || false,
    });

    setAnswers(newAnswers);

    // In practice mode, auto-advance after 2 seconds if solution is shown
    // if (showSolutionsImmediately && currentIndex < questions.length - 1) {
    //   setTimeout(() => {
    //     setCurrentIndex((prev) => prev + 1);
    //   }, 10000);
    // }
  };

  const handleFlagToggle = () => {
    const newAnswers = new Map(answers);
    const currentAnswer = answers.get(currentQuestion.id);

    if (currentAnswer) {
      newAnswers.set(currentQuestion.id, {
        ...currentAnswer,
        isFlagged: !currentAnswer.isFlagged,
      });
    } else {
      newAnswers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        selectedAnswer: '',
        isCorrect: false,
        isFlagged: true,
      });
    }

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Always save to localStorage first so results page can load immediately
    saveSessionToLocalStorage(sessionId, {
      questions,
      answers,
      startTime,
      mode,
    });

    // Also save to Supabase if user is logged in (non-blocking)
    if (user) {
      try {
        const results = calculateResults(questions, answers);
        const timeTaken = Math.floor((Date.now() - startTime.getTime()) / 1000);

        saveExamResults(
          user.id,
          sessionId,
          mode,
          questions,
          answers,
          results,
          timeTaken
        ).catch((error) => {
          console.error('Error saving results to Supabase:', error);
        });
      } catch (error) {
        console.error('Error calculating results:', error);
      }
    }

    // Navigate to results immediately
    router.push(`/results/${sessionId}`);
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const currentAnswer = answers.get(currentQuestion.id);
  const showSolution = showSolutionsImmediately && currentAnswer !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timer (Mock Mode Only) */}
            {mode === 'mock' && timerDuration && (
              <Timer duration={timerDuration} onTimeUp={handleTimeUp} />
            )}

            {/* Question Card */}
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedAnswer={currentAnswer?.selectedAnswer}
              showSolution={showSolution}
              onAnswerSelect={handleAnswerSelect}
              onFlagToggle={handleFlagToggle}
              isFlagged={currentAnswer?.isFlagged}
            />

            {/* Navigation Controls */}
            <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {questions.length}
              </span>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                onNavigate={setCurrentIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
