import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    version: '1.0.0',
    name: 'Budgeti',
    releaseDate: '2026-11-18',
    channel: 'stable',
    isLatest: true,
    releaseNotes: 'Release 1.0.0: Offline PWA Sync, Adaptive UI Themes, Advanced Habit Prompts, Wallet Settings, and About section.',
  });
}
