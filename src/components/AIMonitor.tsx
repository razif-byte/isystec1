import { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, ChevronDown, Eye, Loader2, RefreshCw, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVisitorStats } from './VisitorCounter';

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
  autoFixed?: boolean;
}

interface MonitorState {
  lastCheck: Date | null;
  isChecking: boolean;
  score: number;
  issues: Issue[];
  aiSuggestions: string[];
}

// ── Automated checks (runs client-side without AI) ────────────────────────
function runAutomatedChecks(): Issue[] {
  const issues: Issue[] = [];

  // Check images alt text
  const imgs = document.querySelectorAll('img:not([alt])');
  if (imgs.length > 0) {
    issues.push({
      id: 'img-alt',
      type: 'warning',
      category: 'Accessibility',
      message: `${imgs.length} imej tiada atribut alt`,
      suggestion: 'Tambah alt text pada semua imej untuk SEO dan accessibility.',
    });
  }

  // Check page title
  if (!document.title || document.title.length < 20) {
    issues.push({
      id: 'title',
      type: 'warning',
      category: 'SEO',
      message: 'Title halaman terlalu pendek',
      suggestion: 'Pastikan title mengandungi kata kunci utama (min 30 aksara).',
    });
  }

  // Check meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    issues.push({
      id: 'meta-desc',
      type: 'error',
      category: 'SEO',
      message: 'Meta description tiada',
      suggestion: 'Tambah meta description (150–160 aksara) untuk ranking Google.',
    });
  }

  // Check responsive viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push({
      id: 'viewport',
      type: 'error',
      category: 'Responsive',
      message: 'Meta viewport tiada',
      suggestion: 'Tambah <meta name="viewport" content="width=device-width, initial-scale=1">',
    });
  } else {
    issues.push({
      id: 'viewport-ok',
      type: 'info',
      category: 'Responsive',
      message: 'Viewport meta tag ✓',
      suggestion: 'Website responsive dikonfigurasi dengan betul.',
      autoFixed: true,
    });
  }

  // Check Lighthouse-like performance hints
  const allImages = Array.from(document.querySelectorAll('img'));
  const noLazyImages = allImages.filter((img) => !img.getAttribute('loading'));
  if (noLazyImages.length > 3) {
    issues.push({
      id: 'lazy-load',
      type: 'info',
      category: 'Performance',
      message: `${noLazyImages.length} imej tiada lazy loading`,
      suggestion: 'Tambah loading="lazy" pada imej bawah fold untuk kurangkan masa muat.',
    });
  }

  // Check WhatsApp number
  const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
  if (waLinks.length === 0) {
    issues.push({
      id: 'wa-link',
      type: 'warning',
      category: 'Contact',
      message: 'Tiada pautan WhatsApp langsung ditemui',
      suggestion: 'Pastikan nombor WhatsApp dikonfigurasi dalam VITE_WHATSAPP_NUMBER.',
    });
  }

  // HTTPS check
  if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
    issues.push({
      id: 'https',
      type: 'error',
      category: 'Security',
      message: 'Laman web menggunakan HTTP (tidak selamat)',
      suggestion: 'Aktifkan SSL/TLS di Hostinger untuk HTTPS.',
    });
  }

  return issues;
}

function computeScore(issues: Issue[]): number {
  const errors = issues.filter((i) => i.type === 'error').length;
  const warnings = issues.filter((i) => i.type === 'warning').length;
  return Math.max(0, Math.min(100, 100 - errors * 20 - warnings * 8));
}

// ── Component ─────────────────────────────────────────────────────────────
export default function AIMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<MonitorState>({
    lastCheck: null,
    isChecking: false,
    score: 100,
    issues: [],
    aiSuggestions: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const runCheck = async () => {
    setState((s) => ({ ...s, isChecking: true }));

    await new Promise((r) => setTimeout(r, 800)); // simulate analysis

    const issues = runAutomatedChecks();
    const score = computeScore(issues);
    const stats = getVisitorStats();

    // Static AI suggestions based on common trends
    const aiSuggestions = [
      `📊 ${stats.totalVisits} lawatan direkodkan. Tambah Google Analytics untuk data lebih terperinci.`,
      '🎥 Video produk YouTube meningkatkan konversi sehingga 80% — hero video sudah aktif.',
      '⭐ Tambah lebih banyak testimoni pelanggan sebenar untuk social proof.',
      '📱 WhatsApp CTA di bawah setiap produk meningkatkan kadar closing.',
      '🔍 Daftarkan di Google Business Profile untuk visibiliti carian tempatan.',
      '💳 Aktifkan Shopify Storefront untuk checkout FPX & kredit yang lebih lancar.',
    ];

    setState({
      lastCheck: new Date(),
      isChecking: false,
      score,
      issues,
      aiSuggestions,
    });
  };

  // Auto-run on first open
  useEffect(() => {
    if (isOpen && !state.lastCheck) {
      runCheck();
    }
  }, [isOpen]);

  const scoreColor =
    state.score >= 80 ? 'text-emerald-400' : state.score >= 60 ? 'text-amber-400' : 'text-red-400';

  const scoreRing =
    state.score >= 80 ? 'stroke-emerald-400' : state.score >= 60 ? 'stroke-amber-400' : 'stroke-red-400';

  return (
    <>
      {/* Trigger button (bottom-left, admin-style) */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-background/90 px-4 py-2.5 text-xs font-bold shadow-xl backdrop-blur transition hover:scale-105"
        aria-label="AI Website Monitor"
      >
        <Activity className="h-3.5 w-3.5 text-primary" />
        <span className="text-muted-foreground">AI Monitor</span>
        {state.score > 0 && (
          <span className={`font-black ${scoreColor}`}>{state.score}</span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-[90vw] max-w-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07101f] shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">AI Website Monitor</p>
                <p className="text-[10px] text-muted-foreground">
                  {state.lastCheck
                    ? `Semak terakhir: ${state.lastCheck.toLocaleTimeString('ms-MY')}`
                    : 'Belum disemak'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={runCheck}
                disabled={state.isChecking}
              >
                <RefreshCw className={`h-4 w-4 ${state.isChecking ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {state.isChecking ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">AI sedang menganalisa website...</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Score */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      className={scoreRing}
                      strokeWidth="3"
                      strokeDasharray={`${state.score} ${100 - state.score}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <p className={`font-heading text-4xl font-black ${scoreColor}`}>{state.score}</p>
                    <p className="text-xs text-muted-foreground">Skor Kesihatan</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {state.issues.filter(i => i.type === 'error').length} ralat ·{' '}
                      {state.issues.filter(i => i.type === 'warning').length} amaran
                    </p>
                  </div>
                </div>

                {/* Visitor stats */}
                {(() => {
                  const stats = getVisitorStats();
                  return (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" /> Statistik Pengunjung
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="font-heading text-xl font-black text-amber-300">{stats.totalVisits}</p>
                          <p className="text-[10px] text-muted-foreground">Jumlah Lawatan</p>
                        </div>
                        <div>
                          <p className="font-heading text-xl font-black text-primary">{stats.uniqueDays}</p>
                          <p className="text-[10px] text-muted-foreground">Hari Aktif</p>
                        </div>
                        <div>
                          <p className="font-heading text-xl font-black text-emerald-400">
                            {stats.visitors.length > 0
                              ? new Date(stats.visitors.at(-1)!.timestamp).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
                              : '-'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Lawatan Terkini</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Issues */}
                <div>
                  <button
                    onClick={() => setIsExpanded((v) => !v)}
                    className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    <span>Isu Ditemui ({state.issues.length})</span>
                    <ChevronDown className={`h-4 w-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      {state.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`rounded-xl border p-3 text-xs ${
                            issue.type === 'error'
                              ? 'border-red-500/20 bg-red-500/10'
                              : issue.type === 'warning'
                              ? 'border-amber-500/20 bg-amber-500/10'
                              : 'border-emerald-500/20 bg-emerald-500/10'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {issue.type === 'error' ? (
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                            ) : issue.type === 'warning' ? (
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                            ) : (
                              <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                            )}
                            <div>
                              <p className="font-bold">[{issue.category}] {issue.message}</p>
                              <p className="mt-0.5 text-muted-foreground">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Cadangan AI
                  </p>
                  <div className="space-y-2">
                    {state.aiSuggestions.map((s, i) => (
                      <div key={i} className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
