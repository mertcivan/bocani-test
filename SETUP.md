# Setup Guide - Bocconi Prep Master

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- Tailwind CSS
- PapaParse (CSV parser)
- KaTeX (Math renderer)
- Lucide React (Icons)
- TypeScript

### Step 2: Verify CSV Data

Check that `data/questions.csv` exists and contains sample questions. The file should have these headers:
```
ID,Category,SubCategory,Difficulty,Mode,Question_Text,Option_A,Option_B,Option_C,Option_D,Option_E,Correct_Answer,Solution_Text,Image_URL
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

### Step 4: Test the Application

1. **Home Page**: You should see the landing page with two mode cards
2. **Practice Mode**: Click "Start Practicing" → Select filters → Start session
3. **Mock Exam**: Click "Start Mock Exam" → Confirm → Begin timed exam
4. **Dashboard**: View after completing at least one session

## Project Structure Overview

```
Bocani_test/
│
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home/landing page
│   ├── globals.css               # Global styles and Tailwind
│   ├── practice/page.tsx         # Practice mode with filters
│   ├── mock-exam/page.tsx        # Mock exam with timer
│   ├── results/[sessionId]/      # Dynamic results page
│   └── dashboard/page.tsx        # Analytics dashboard
│
├── components/                   # Reusable React components
│   ├── QuestionCard.tsx          # Displays questions and options
│   ├── ExamEngine.tsx            # Core exam logic and state
│   ├── Timer.tsx                 # Countdown timer component
│   └── QuestionNavigator.tsx     # Sidebar navigation
│
├── lib/                          # Utility functions
│   ├── csvParser.ts              # CSV parsing and filtering
│   ├── examUtils.ts              # Exam calculations and storage
│   └── mathRenderer.tsx          # KaTeX math rendering
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # All type definitions
│
├── data/                         # Data storage
│   └── questions.csv             # Questions database
│
├── public/                       # Static files
│   └── images/
│       └── questions/            # Question images (add here)
│
└── Configuration files
    ├── package.json              # Dependencies
    ├── tsconfig.json             # TypeScript config
    ├── tailwind.config.ts        # Tailwind config
    ├── next.config.js            # Next.js config
    └── postcss.config.js         # PostCSS config
```

## Adding Your Questions

### CSV Format Example

```csv
1,Mathematics,Algebra,Easy,Practice,"Solve: $x + 5 = 10$",3,4,5,6,7,C,"Subtract 5: $x = 5$",
```

### Field Descriptions

- **ID**: Unique number (1, 2, 3...)
- **Category**: Broad category (Mathematics, Logic, etc.)
- **SubCategory**: Specific topic (Algebra, Geometry, etc.)
- **Difficulty**: Easy, Medium, or Hard (case-sensitive)
- **Mode**: Practice or Mock (case-sensitive)
- **Question_Text**: Question with LaTeX math in $...$
- **Option_A through E**: Answer choices
- **Correct_Answer**: A, B, C, D, or E
- **Solution_Text**: Explanation with LaTeX support
- **Image_URL**: Optional image filename (leave empty if none)

### LaTeX Examples

**Inline math**:
```
"Find the value of $x^2$ when $x = 3$"
```

**Display math**:
```
"Solve $$\frac{x+1}{2} = 5$$"
```

**Complex formulas**:
```
"The quadratic formula is $$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$"
```

## Adding Images

1. Place images in `public/images/questions/`
2. Supported formats: PNG, JPG, WEBP
3. Reference in CSV using just the filename: `graph1.png`
4. Recommended size: 600-800px wide

Example CSV entry with image:
```csv
15,Mathematics,Graphs,Medium,Practice,"What is the slope of the line?",2,3,4,5,6,B,"Rise over run: slope = 3",graph1.png
```

## Customization Guide

### 1. Change Color Scheme

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#3b82f6',  // Main blue
    600: '#2563eb',  // Darker blue
    // ... add your colors
  },
}
```

### 2. Modify Exam Settings

**Mock Exam Duration** (`app/mock-exam/page.tsx`):
```typescript
const MOCK_EXAM_DURATION = 90 * 60; // 90 minutes
```

**Question Count** (`app/mock-exam/page.tsx`):
```typescript
const MOCK_EXAM_QUESTIONS = 60; // 60 questions
```

### 3. Change Branding

Edit `app/layout.tsx`:
```typescript
export const metadata = {
  title: 'Your App Name',
  description: 'Your description',
};
```

Edit `app/page.tsx` to change home page text.

### 4. Add More Difficulty Levels

1. Update `types/index.ts`:
```typescript
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
```

2. Update filter UI in `app/practice/page.tsx`

## Component Architecture

### ExamEngine (Core Logic)
- Manages exam state (answers, timer, navigation)
- Auto-saves progress every 30 seconds
- Handles answer submission and flagging
- Redirects to results on completion

### QuestionCard (UI)
- Displays question with LaTeX rendering
- Shows options with color coding
- Displays solution when enabled
- Supports image display

### Timer (Mock Exam)
- Countdown from specified duration
- Visual warnings at 5 minutes
- Auto-submits on time expiration
- Progress bar visualization

### QuestionNavigator (Sidebar)
- Shows all question numbers
- Status indicators (answered/flagged/unanswered)
- Quick navigation between questions
- Summary statistics

## Data Flow

```
CSV File
  ↓
csvParser.ts (parseQuestionsCSV)
  ↓
Filter/Select Questions
  ↓
ExamEngine Component
  ↓
User Answers → LocalStorage
  ↓
Results Calculation
  ↓
Results Page + Dashboard
```

## LocalStorage Structure

Sessions are saved in localStorage with this structure:

```javascript
{
  "exam-session-<timestamp>": {
    questions: Question[],
    answers: [questionId, UserAnswer][],
    startTime: ISO string,
    mode: 'practice' | 'mock'
  }
}
```

## Troubleshooting

### Questions not loading
- Check `data/questions.csv` exists
- Verify CSV format matches headers
- Check browser console for errors

### Math not rendering
- Ensure KaTeX is installed: `npm install katex`
- Check LaTeX syntax (use $...$ for inline)
- Import KaTeX CSS in component

### Images not displaying
- Verify images are in `public/images/questions/`
- Check filename matches CSV exactly
- Ensure proper image format (PNG/JPG/WEBP)

### Timer issues
- localStorage must be enabled
- Check browser compatibility
- Verify timer duration is set correctly

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or export as static site
npm run build
# Then deploy the 'out' folder
```

## Best Practices

1. **CSV Management**
   - Keep backups of your CSV file
   - Use consistent formatting
   - Test new questions before adding many

2. **Performance**
   - Optimize images before adding (compress to ~100KB)
   - Keep CSV file under 1000 rows for best performance
   - Use code splitting for large question sets

3. **User Experience**
   - Test on mobile devices
   - Ensure timer is visible during mock exams
   - Provide clear feedback for all actions

4. **Data Integrity**
   - Validate CSV format before deployment
   - Test all question types
   - Verify correct answers are accurate

## Next Steps

1. Add more questions to `data/questions.csv`
2. Customize colors and branding
3. Add question images if needed
4. Test thoroughly on different devices
5. Build for production deployment

## Need Help?

- Review component code for implementation details
- Check browser console for errors
- Verify CSV format matches specification
- Test with sample data first

Happy coding! 🚀
