# Complete Folder Structure

## Overview
This document provides a complete reference of all files in the Bocconi Prep Master project.

```
d:\opencv_app\Bocani_test/
│
├── 📁 app/                                    # Next.js App Router
│   ├── layout.tsx                             # Root layout with metadata & fonts
│   ├── page.tsx                               # Landing page (Home)
│   ├── globals.css                            # Global Tailwind CSS styles
│   │
│   ├── 📁 practice/
│   │   └── page.tsx                           # Practice Mode page with filters
│   │
│   ├── 📁 mock-exam/
│   │   └── page.tsx                           # Mock Exam Mode page
│   │
│   ├── 📁 results/
│   │   └── 📁 [sessionId]/
│   │       └── page.tsx                       # Dynamic results page
│   │
│   └── 📁 dashboard/
│       └── page.tsx                           # Dashboard with analytics
│
├── 📁 components/                             # Reusable React Components
│   ├── QuestionCard.tsx                       # Display questions with options & math
│   ├── ExamEngine.tsx                         # Core exam engine with state management
│   ├── Timer.tsx                              # Countdown timer for mock exams
│   └── QuestionNavigator.tsx                  # Sidebar question navigation
│
├── 📁 lib/                                    # Utility Functions & Helpers
│   ├── csvParser.ts                           # CSV parsing and filtering logic
│   ├── examUtils.ts                           # Exam calculations & localStorage
│   └── mathRenderer.tsx                       # KaTeX LaTeX math renderer
│
├── 📁 types/                                  # TypeScript Type Definitions
│   └── index.ts                               # All interfaces and types
│
├── 📁 data/                                   # Application Data
│   └── questions.csv                          # Questions database (CSV format)
│
├── 📁 public/                                 # Static Assets
│   └── 📁 images/
│       └── 📁 questions/
│           └── .gitkeep                       # Placeholder (add images here)
│
├── 📄 Configuration Files
├── package.json                               # Dependencies and scripts
├── tsconfig.json                              # TypeScript configuration
├── tailwind.config.ts                         # Tailwind CSS configuration
├── next.config.js                             # Next.js configuration
├── postcss.config.js                          # PostCSS configuration
├── .gitignore                                 # Git ignore rules
│
└── 📄 Documentation
    ├── README.md                              # Project overview and features
    ├── SETUP.md                               # Detailed setup instructions
    └── FOLDER_STRUCTURE.md                    # This file
```

## File Purposes

### App Directory (Routes)

| File | Purpose | Key Features |
|------|---------|--------------|
| `app/layout.tsx` | Root layout wrapper | Metadata, font loading, global structure |
| `app/page.tsx` | Home/landing page | Mode selection, feature overview |
| `app/globals.css` | Global styles | Tailwind directives, custom CSS |
| `app/practice/page.tsx` | Practice mode | Filter selection, immediate feedback |
| `app/mock-exam/page.tsx` | Mock exam mode | Timer setup, exam start confirmation |
| `app/results/[sessionId]/page.tsx` | Results display | Score breakdown, review mode |
| `app/dashboard/page.tsx` | Analytics dashboard | Performance stats, session history |

### Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `QuestionCard` | Display questions | question, showSolution, onAnswerSelect |
| `ExamEngine` | Exam state manager | questions, mode, sessionId, timerDuration |
| `Timer` | Countdown timer | duration, onTimeUp, isPaused |
| `QuestionNavigator` | Question grid nav | questions, currentIndex, answers |

### Library Functions

| File | Exports | Purpose |
|------|---------|---------|
| `csvParser.ts` | parseQuestionsCSV, filterQuestions | CSV reading and filtering |
| `examUtils.ts` | calculateResults, formatTime | Result calculations, time formatting |
| `mathRenderer.tsx` | MathRenderer | LaTeX to HTML with KaTeX |

### Types

| Type | Description |
|------|-------------|
| `Question` | Question data structure from CSV |
| `UserAnswer` | User's answer with metadata |
| `ExamResults` | Calculated exam results |
| `ExamSession` | Complete session state |
| `DashboardStats` | Aggregated statistics |

## Configuration Files Explained

### package.json
- **Dependencies**: React, Next.js, Tailwind, PapaParse, KaTeX
- **Scripts**: dev, build, start, lint
- **Dev Dependencies**: TypeScript, ESLint, PostCSS

### tsconfig.json
- **Compiler Options**: Strict mode, ES2020, JSX preserve
- **Path Aliases**: `@/*` maps to root directory
- **Include**: All TypeScript/TSX files

### tailwind.config.ts
- **Content Paths**: All component files
- **Theme Extensions**: Custom colors, fonts
- **Plugins**: None (can add if needed)

### next.config.js
- **React Strict Mode**: Enabled
- **Image Domains**: Configure if using external images

## Data Structure

### questions.csv Format
```csv
ID,Category,SubCategory,Difficulty,Mode,Question_Text,Option_A,Option_B,Option_C,Option_D,Option_E,Correct_Answer,Solution_Text,Image_URL
```

### LocalStorage Keys
- `exam-session-practice-<timestamp>`
- `exam-session-mock-<timestamp>`

## Asset Organization

### Images
```
public/images/questions/
├── graph1.png
├── diagram2.jpg
└── chart3.webp
```

Reference in CSV: Just filename (e.g., `graph1.png`)

## Route Structure

```
/                           → Home page
/practice                   → Practice mode setup
/practice (started)         → ExamEngine with solutions
/mock-exam                  → Mock exam setup
/mock-exam (started)        → ExamEngine with timer
/results/[sessionId]        → Results page
/results/[sessionId] (review) → Review mode
/dashboard                  → Dashboard
```

## Component Hierarchy

```
Layout
└── Page
    ├── Practice Mode
    │   └── ExamEngine
    │       ├── Timer (if mock)
    │       ├── QuestionCard
    │       │   └── MathRenderer
    │       └── QuestionNavigator
    │
    ├── Mock Exam Mode
    │   └── (same as Practice)
    │
    ├── Results Page
    │   └── QuestionCard (review)
    │
    └── Dashboard
        └── Stats Cards
```

## State Management

### ExamEngine State
- `currentIndex`: Current question index
- `answers`: Map of question IDs to user answers
- `startTime`: Session start timestamp

### LocalStorage
- Auto-saves every 30 seconds
- Persists between browser sessions
- Used for results and dashboard

## Styling Architecture

### Tailwind Utilities
- Used for all component styling
- Custom classes in `globals.css`
- Responsive design with breakpoints

### Color System
```
primary: Blue (main actions)
success: Green (correct answers)
error: Red (incorrect answers)
warning: Orange/Yellow (flagged questions)
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.2.0 | React framework |
| react | ^18.3.0 | UI library |
| tailwindcss | ^3.4.0 | Styling |
| papaparse | ^5.4.1 | CSV parsing |
| katex | ^0.16.9 | Math rendering |
| lucide-react | ^0.344.0 | Icons |
| typescript | ^5.3.0 | Type safety |

## Build Output

```
npm run build → .next/
npm start     → Production server
```

## Development Workflow

1. Edit files in `app/`, `components/`, or `lib/`
2. Changes hot-reload automatically
3. Add questions to `data/questions.csv`
4. Add images to `public/images/questions/`
5. Test in browser at localhost:3000

## Deployment Checklist

- [ ] Add all questions to CSV
- [ ] Optimize and add all images
- [ ] Test all routes
- [ ] Customize branding
- [ ] Run `npm run build`
- [ ] Test production build
- [ ] Deploy to hosting platform

## Future Extensibility

Possible additions:
- User authentication
- Question creation UI
- Performance analytics
- Export results to PDF
- Social sharing
- Multi-language support

---

**Last Updated**: 2026-01-17
**Version**: 1.0.0
