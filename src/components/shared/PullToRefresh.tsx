'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 64,
  className = '',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if page or container is scrolled to the very top
  const isAtTop = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const windowScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const containerScrollTop = containerRef.current?.scrollTop || 0;
    return windowScrollTop <= 2 && containerScrollTop <= 2;
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isRefreshing || !isAtTop()) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;

    // Only handle downward drag when at the very top
    if (deltaY > 0 && isAtTop()) {
      // Elastic damping resistance
      const damped = Math.min(Math.pow(deltaY, 0.82) * 1.8, threshold * 1.5);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
      isDraggingRef.current = false;
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || isRefreshing) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      // Light haptic feedback on supported mobile devices
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // ignore
        }
      }

      try {
        await onRefresh();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 200);
      } catch (err) {
        console.error('Refresh error:', err);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Reset pull distance on scroll or window resize
  useEffect(() => {
    const handleScroll = () => {
      if (isDraggingRef.current && window.scrollY > 5) {
        isDraggingRef.current = false;
        startYRef.current = null;
        setPullDistance(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const progress = Math.min(pullDistance / threshold, 1);
  const isTriggered = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative ${className}`}
      style={{ overscrollBehaviorY: 'contain' }}
    >
      {/* Pull Indicator Dropdown */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center overflow-hidden transition-all duration-150 z-20"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md text-xs font-semibold">
          {isRefreshing ? (
            isSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Updated</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-slate-300">Refreshing...</span>
              </>
            )
          ) : isTriggered ? (
            <>
              <RefreshCw
                className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200"
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
              <span className="text-emerald-400">Release to refresh</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
                style={{ transform: `rotate(${progress * 180}deg)` }}
              />
              <span className="text-slate-400">Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content with smooth translateY */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
