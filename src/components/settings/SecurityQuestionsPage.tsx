'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, ShieldCheck } from 'lucide-react';

interface SecurityQuestionsPageProps {
  onStatusChange?: (status: string) => void;
}

export function SecurityQuestionsPage({ onStatusChange }: SecurityQuestionsPageProps) {
  const [question, setQuestion] = useState('What was your first car or bike?');
  const [answer, setAnswer] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedQ = localStorage.getItem('budgeti_sec_q');
    const savedA = localStorage.getItem('budgeti_sec_a');
    if (savedQ && savedA) {
      setQuestion(savedQ);
      setAnswer(savedA);
      setIsSaved(true);
      if (onStatusChange) onStatusChange('Configured');
    }
  }, [onStatusChange]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    localStorage.setItem('budgeti_sec_q', question);
    localStorage.setItem('budgeti_sec_a', answer.trim());
    setIsSaved(true);
    if (onStatusChange) onStatusChange('Configured');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-500" /> Account Recovery Security Question
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Used to verify local data restore on this device in offline mode.
        </p>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Question
            </label>
            <select
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="What was your first car or bike?">What was your first car or bike?</option>
              <option value="What is your mother's maiden name?">What is your mother&apos;s maiden name?</option>
              <option value="What is the name of your childhood best friend?">What is the name of your childhood best friend?</option>
              <option value="In what city were you born?">In what city were you born?</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Answer
            </label>
            <input
              type="text"
              placeholder="Enter your confidential answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {isSaved ? 'Update Security Question' : 'Save Security Question'}
          </button>
        </form>

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Security questions are active on this device.</span>
          </div>
        )}
      </div>
    </div>
  );
}
