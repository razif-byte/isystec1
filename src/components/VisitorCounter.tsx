import { useEffect, useRef } from 'react';

interface VisitorData {
  id: string;
  timestamp: string;
  date: string;
  referrer: string;
  userAgent: string;
  screen: string;
  language: string;
  page: string;
}

interface VisitorStats {
  totalVisits: number;
  uniqueDays: number;
  lastVisit: string;
  visitors: VisitorData[];
}

const STORAGE_KEY = 'isystec_visitors';
const MAX_STORED = 200;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getStats(): VisitorStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalVisits: 0, uniqueDays: 0, lastVisit: '', visitors: [] };
}

function saveStats(stats: VisitorStats): void {
  try {
    // Keep only last MAX_STORED visitors
    if (stats.visitors.length > MAX_STORED) {
      stats.visitors = stats.visitors.slice(-MAX_STORED);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/** Record this page visit and return updated stats */
export function recordVisit(): VisitorStats {
  const stats = getStats();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const visitor: VisitorData = {
    id: generateId(),
    timestamp: now.toISOString(),
    date: dateStr,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    page: window.location.pathname,
  };

  stats.totalVisits++;
  stats.lastVisit = now.toISOString();
  stats.visitors.push(visitor);

  // Count unique days
  const days = new Set(stats.visitors.map((v) => v.date));
  stats.uniqueDays = days.size;

  saveStats(stats);
  return stats;
}

export function getVisitorStats(): VisitorStats {
  return getStats();
}

/** Small visitor counter badge shown in footer */
export default function VisitorCounter() {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    // Add a small delay so it doesn't affect initial render
    const t = setTimeout(() => {
      recordVisit();
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  const stats = getStats();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>{stats.totalVisits.toLocaleString()} lawatan · {stats.uniqueDays} hari aktif</span>
    </div>
  );
}
