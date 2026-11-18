'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-3xl mx-auto mb-6">
          ₦
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">You&apos;re Offline</h1>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          No internet connection detected. Your locally cached data is available.
          Any changes you make will sync automatically when you reconnect.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
