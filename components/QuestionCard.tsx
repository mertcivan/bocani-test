'use client';

import { Question, UserAnswer } from '@/types';
import { MathRenderer } from '@/lib/mathRenderer';
import Image from 'next/image';
import { CheckCircle2, XCircle, Flag } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer?: string;
  showSolution?: boolean;
  onAnswerSelect: (answer: string) => void;
  onFlagToggle?: () => void;
  isFlagged?: boolean;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  showSolution = false,
  onAnswerSelect,
  onFlagToggle,
  isFlagged = false,
  disabled = false,
}: QuestionCardProps) {
  const options = [
    { key: 'A', value: question.optionA },
    { key: 'B', value: question.optionB },
    { key: 'C', value: question.optionC },
    { key: 'D', value: question.optionD },
    { key: 'E', value: question.optionE },
  ];

  const isCorrectAnswer = (optionKey: string) => {
    return optionKey === question.correctAnswer;
  };

  const getOptionStyle = (optionKey: string) => {
    const isSelected = selectedAnswer === optionKey;
    const isCorrect = isCorrectAnswer(optionKey);

    if (!showSolution && !isSelected) {
      return 'border-gray-300 hover:border-primary-400 hover:bg-primary-50';
    }

    if (!showSolution && isSelected) {
      return 'border-primary-500 bg-primary-50';
    }

    if (showSolution && isCorrect) {
      return 'border-green-500 bg-green-50';
    }

    if (showSolution && isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">
            Question {questionNumber}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
            {question.difficulty}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {question.subCategory}
          </span>
        </div>
        {onFlagToggle && (
          <button
            onClick={onFlagToggle}
            className={`p-2 rounded-full transition-colors ${
              isFlagged
                ? 'bg-orange-100 text-orange-600'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
            aria-label="Flag question"
          >
            <Flag className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <MathRenderer
          content={question.questionText}
          className="text-lg leading-relaxed text-gray-900"
        />
      </div>

      {/* Question Image */}
      {question.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={`/images/questions/${question.imageUrl}`}
            alt="Question illustration"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => !disabled && onAnswerSelect(option.key)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
              option.key
            )} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
                {option.key}
              </span>
              <div className="flex-1 pt-1">
                <MathRenderer content={option.value} className="text-gray-800" />
              </div>
              {showSolution && isCorrectAnswer(option.key) && (
                <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-600" />
              )}
              {showSolution && selectedAnswer === option.key && !isCorrectAnswer(option.key) && (
                <XCircle className="flex-shrink-0 w-6 h-6 text-red-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Solution */}
      {showSolution && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Solution</h4>
          <MathRenderer content={question.solutionText} className="text-blue-800" />
        </div>
      )}
    </div>
  );
}
