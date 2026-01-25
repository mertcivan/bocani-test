'use client';

import { Question, UserAnswer } from '@/types';
import { getQuestionStatus } from '@/lib/examUtils';
import { CheckCircle2, Circle, Flag } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  answers: Map<string, UserAnswer>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  onNavigate,
}: QuestionNavigatorProps) {
  const getStatusIcon = (questionId: string) => {
    const status = getQuestionStatus(questionId, answers);
    const answer = answers.get(questionId);

    if (answer?.isFlagged) {
      return <Flag className="w-4 h-4" fill="currentColor" />;
    }

    if (status === 'answered') {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    return <Circle className="w-4 h-4" />;
  };

  const getStatusStyle = (questionId: string, index: number) => {
    const status = getQuestionStatus(questionId, answers);
    const answer = answers.get(questionId);
    const isCurrent = index === currentIndex;

    if (isCurrent) {
      return 'bg-primary-600 text-white border-primary-600';
    }

    if (answer?.isFlagged) {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    }

    if (status === 'answered') {
      return 'bg-green-100 text-green-700 border-green-300';
    }

    return 'bg-white text-gray-700 border-gray-300 hover:border-primary-400';
  };

  const answeredCount = questions.filter((q) => answers.has(q.id)).length;
  const flaggedCount = questions.filter((q) => answers.get(q.id)?.isFlagged).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            Answered: <span className="font-semibold">{answeredCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-orange-600" fill="currentColor" />
          <span className="text-gray-600">
            Flagged: <span className="font-semibold">{flaggedCount}</span>
          </span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onNavigate(index)}
            className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${getStatusStyle(
              question.id,
              index
            )}`}
          >
            <span className="text-sm font-semibold">{index + 1}</span>
            {getStatusIcon(question.id)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-100"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-100"></div>
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
