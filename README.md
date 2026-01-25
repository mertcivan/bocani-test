# Bocconi Prep Master

A high-end exam preparation platform built with Next.js 14+ that functions as an interactive exam engine using a local CSV file as the database.

## Features

### Practice Mode
- Filter questions by SubCategory and Difficulty
- Immediate solution feedback after each answer
- Learn at your own pace with no time limits
- Detailed explanations with LaTeX math rendering

### Mock Exam Mode
- 50 random questions from the mock question pool
- 75-minute countdown timer
- Sidebar navigation with question status tracking
- Flag questions for review
- Comprehensive results page with performance breakdown

### Dashboard
- Track overall performance and statistics
- View success rates by SubCategory
- Review past sessions and scores
- Monitor progress over time

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS
- **CSV Parsing**: PapaParse
- **Math Rendering**: KaTeX
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Project Structure

```
Bocani_test/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── practice/
│   │   └── page.tsx            # Practice mode with filters
│   ├── mock-exam/
│   │   └── page.tsx            # Mock exam mode
│   ├── results/
│   │   └── [sessionId]/
│   │       └── page.tsx        # Results and review page
│   └── dashboard/
│       └── page.tsx            # Dashboard with analytics
├── components/
│   ├── QuestionCard.tsx        # Question display with options
│   ├── ExamEngine.tsx          # Main exam logic component
│   ├── Timer.tsx               # Countdown timer
│   └── QuestionNavigator.tsx  # Sidebar navigation
├── lib/
│   ├── csvParser.ts            # CSV parsing utilities
│   ├── examUtils.ts            # Exam helper functions
│   └── mathRenderer.tsx        # LaTeX math rendering
├── types/
│   └── index.ts                # TypeScript type definitions
├── data/
│   └── questions.csv           # Questions database
├── public/
│   └── images/
│       └── questions/          # Question images (optional)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## CSV Format

The `data/questions.csv` file should follow this format:

| Column | Description |
|--------|-------------|
| ID | Unique question identifier |
| Category | Main category (e.g., Mathematics, Logic) |
| SubCategory | Specific topic (e.g., Algebra, Geometry) |
| Difficulty | Easy, Medium, or Hard |
| Mode | Practice or Mock |
| Question_Text | Question with LaTeX support (use $ delimiters) |
| Option_A | First option |
| Option_B | Second option |
| Option_C | Third option |
| Option_D | Fourth option |
| Option_E | Fifth option |
| Correct_Answer | A, B, C, D, or E |
| Solution_Text | Detailed explanation with LaTeX support |
| Image_URL | Optional filename in `/public/images/questions/` |

### LaTeX Math Support

Use LaTeX in questions and solutions:
- Inline math: `$x^2 + y^2$`
- Display math: `$$\frac{a}{b}$$`

Example:
```
"Solve for $x$: $2x + 5 = 13$"
```

## Adding Questions

1. Open `data/questions.csv`
2. Add new rows following the format
3. Set `Mode` to "Practice" for practice questions or "Mock" for mock exam questions
4. For images, place them in `public/images/questions/` and reference the filename in `Image_URL`

## Features in Detail

### Practice Mode
- Users select filters (SubCategory, Difficulty)
- Questions are displayed one at a time
- Solutions appear immediately after answering
- Navigate between questions freely
- Session is auto-saved every 30 seconds

### Mock Exam Mode
- 50 random questions tagged as "Mock"
- 75-minute countdown timer with visual warnings
- Question navigator shows status (Answered/Flagged/Unanswered)
- Solutions shown only after submission
- Auto-submit when time expires

### Results Page
- Overall score and grade
- Performance breakdown by SubCategory
- Review mode to see all questions with solutions
- Option to retake or start new session

### Dashboard
- Aggregate statistics across all sessions
- Success rate tracking
- Recent sessions list with quick access to results
- Performance trends

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Timer Duration
Modify in `app/mock-exam/page.tsx`:

```typescript
const MOCK_EXAM_DURATION = 75 * 60; // seconds
```

### Mock Exam Question Count
Modify in `app/mock-exam/page.tsx`:

```typescript
const MOCK_EXAM_QUESTIONS = 50;
```

## Browser Support

- Modern browsers with ES6+ support
- localStorage required for session persistence

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or review the implementation details.
