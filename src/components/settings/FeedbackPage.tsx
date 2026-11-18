'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, Send, CheckCircle2, Star } from 'lucide-react';

interface FeedbackPageProps {
  onOpenSetupGuide: () => void;
}

export function FeedbackPage({ onOpenSetupGuide }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setFeedback('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Feedback and Suggestions
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How can we make Budgeti better? Send your thoughts directly to the developer team.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Thank you!</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your feedback helps us continuously improve Budgeti offline & sync capabilities.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Rating Stars */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate your experience
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-125"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suggestions or Issues
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feature requests or any bugs you encountered..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback
            </button>
          </form>
        )}
      </div>

      {/* App Version Info Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Budgeti Finance System</h4>
          <p className="text-[10px] text-slate-400">Offline PWA v0.1.0 · Google Sheets Powered</p>
        </div>
        <button
          onClick={onOpenSetupGuide}
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-600"
        >
          Setup Guide
        </button>
      </div>
    </div>
  );
}
