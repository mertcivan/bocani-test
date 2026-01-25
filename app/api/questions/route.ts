import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseCSVContent } from '@/lib/csvParser';

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'questions.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const questions = await parseCSVContent(fileContent);

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error reading questions:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
