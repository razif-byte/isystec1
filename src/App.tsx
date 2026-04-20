
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Copy, CreditCard, Heart,
  Mail, Minus, Phone, QrCode, Search, ShoppingCart,
  Smartphone, Star, SunMedium, Trash2, Plus, Wallet, X,
  Home, LayoutGrid, CreditCard as PayIcon, PhoneCall,
  ChevronRight, ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { BUSINESS_INFO, PAYMENT_OPTIONS, PRODUCTS, TESTIMONIALS } from './constants';
import { CartItem, Category, PaymentMethod, Product } from './types';
import Chatbot from './components/Chatbot';
import VisitorCounter from './components/VisitorCounter';
import AIMonitor from './components/AIMonitor';

// ── Social icons (lucide-react v1 removed brand icons) ────────────────────
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// ── Scroll-reveal ──────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-hidden');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.animationDelay = el.dataset.delay ?? '0s';
          el.classList.remove('scroll-hidden');
          el.classList.add('scroll-visible');
          obs.unobserve(el);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ── Constants ──────────────────────────────────────────────────────────────
const YOUTUBE_VIDEO_ID = 'EvwdsI9G6-o';

const CATEGORY_ITEMS: Array<{ id: Category | 'All'; label: string; icon: typeof SunMedium }> = [
  { id: 'All',          label: 'Semua Produk', icon: Wallet },
  { id: 'Security',    label: 'Security',      icon: ShoppingCart },
  { id: 'Solar',       label: 'Solar',         icon: SunMedium },
  { id: 'Accessories', label: 'Accessories',   icon: Wallet },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  shopify:  'Shopify Checkout',
  fpx:      'FPX / Debit / Credit Card',
  duitnow:  'DuitNow QR / Bank Transfer',
  whatsapp: 'WhatsApp Confirmation',
};

const PAYMENT_ICONS = {
  shopify:  ShoppingCart,
  fpx:      CreditCard,
  duitnow:  Smartphone,
  whatsapp: Wallet,
} as const;

const SIDEBAR_LINKS = [
  { label: 'Utama',          id: 'top',      icon: Home },
  { label: 'Katalog',        id: 'products', icon: LayoutGrid },
  { label: 'Cara Pembayaran',id: 'payment',  icon: PayIcon },
  { label: 'Hubungi Kami',   id: 'contact',  icon: PhoneCall },
];

const money = (v: number) => `RM ${v.toFixed(2)}`;
const getDuitNowQrUrl = (size = 220) => {
  const data = encodeURIComponent(`${BUSINESS_INFO.bank}\nNo. Akaun: ${BUSINESS_INFO.accountNo}\n${BUSINESS_INFO.name}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&bgcolor=07101f&color=ffffff&margin=12&format=png`;
};

// ══════════════════════════════════════════════════════════
export default function App() {
  useScrollReveal();

  const [cart, setCart]                         = useState<CartItem[]>([]);
  const [wishlist, setWishlist]                 = useState<string[]>([]);
  const [activeCategory, setActiveCategory]     = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery]           = useState('');
  const [isCartOpen, setIsCartOpen]             = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen]     = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]       = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment]   = useState<PaymentMethod>('duitnow');
  const [customer, setCustomer]                 = useState({ name: '', phone: '', email: '', address: '', note: '' });
  const [orderConfirmed, setOrderConfirmed]     = useState<{ method: PaymentMethod; total: number } | null>(null);
  const [copied, setCopied]                     = useState(false);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      const matchCat  = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !q || [p.name, p.description, p.sku, p.category].some(v => v.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const canUseShopify =
    Boolean(BUSINESS_INFO.shopifyStoreUrl) &&
    Boolean(BUSINESS_INFO.shopifyStorefrontAccessToken) &&
    cart.length > 0 && cart.every(i => i.shopifyVariantId);

  const addToCart = (product: Product) => {
    setCart(cur => {
      const ex = cur.find(i => i.id === product.id);
      if (ex) return cur.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...cur, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.id !== id));
  const updateQty      = (id: string, d: number) => setCart(c => c.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const toggleWishlist = (id: string) => setWishlist(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);

  const buildWhatsAppUrl = (msg: string) => {
    const n = BUSINESS_INFO.whatsappNumber.replace(/\D/g, '');
    return `${n ? `https://wa.me/${n}` : BUSINESS_INFO.whatsappLinkFallback}?text=${encodeURIComponent(msg)}`;
  };

  const normalizeMerchandiseId = (v: string) =>
    v.startsWith('gid://shopify/ProductVariant/') ? v : `gid://shopify/ProductVariant/${v}`;

  const createShopifyCheckoutUrl = async () => {
    const endpoint = `${BUSINESS_INFO.shopifyStoreUrl}/api/${BUSINESS_INFO.shopifyStorefrontApiVersion}/graphql.json`;
    const query = `mutation CreateCart($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl } userErrors { field message } } }`;
    const variables = {
      input: {
        lines: cart.map(i => ({ merchandiseId: normalizeMerchandiseId(i.shopifyVariantId ?? ''), quantity: i.quantity })),
        attributes: [
          { key: 'customer_name', value: customer.name },
          { key: 'customer_phone', value: customer.phone },
          { key: 'customer_address', value: customer.address },
          { key: 'customer_note', value: customer.note || '-' },
          { key: 'payment_method', value: PAYMENT_LABELS[selectedPayment] },
        ],
        buyerIdentity: { email: customer.email || undefined, phone: customer.phone || undefined, countryCode: 'MY' },
      },
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': BUSINESS_INFO.shopifyStorefrontAccessToken },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
    const json = await res.json();
    const errs = json?.data?.cartCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: { message: string }) => e.message).join(', '));
    const url = json?.data?.cartCreate?.cart?.checkoutUrl;
    if (!url) throw new Error('Checkout URL tidak dijana.');
    return url as string;
  };

  const buildOrderMessage = (method: PaymentMethod) => {
    const lines = cart.map(i => `• ${i.name} x${i.quantity} — ${money(i.quantity * i.sellingPrice)}`).join('\n');
    return [
      `🛒 *Pesanan Baru — ${BUSINESS_INFO.name}*`, '',
      `👤 Nama: ${customer.name}`, `📱 Telefon: ${customer.phone}`,
      `📧 Emel: ${customer.email || '-'}`, `🏠 Alamat: ${customer.address}`,
      `💳 Kaedah Bayaran: ${PAYMENT_LABELS[method]}`, `📝 Nota: ${customer.note || '-'}`, '',
      '*Senarai Produk:*', lines, '',
      `*💰 Jumlah: ${money(cartTotal)}*`, '',
      `🏦 Bank: ${BUSINESS_INFO.bank}`, `🔢 No. Akaun: ${BUSINESS_INFO.accountNo}`, `👤 Nama Akaun: ${BUSINESS_INFO.name}`,
    ].join('\n');
  };

  const finalizeOrder = () => {
    setCart([]); setIsCheckoutOpen(false); setOrderConfirmed(null);
    setCustomer({ name: '', phone: '', email: '', address: '', note: '' });
  };

  const proceedPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) { window.alert('Sila isi nama, telefon dan alamat.'); return; }
    const snap = cartTotal;
    const msg  = buildOrderMessage(selectedPayment);

    if ((selectedPayment === 'shopify' || selectedPayment === 'fpx') && canUseShopify) {
      try {
        setIsProcessingPayment(true);
        const url = await createShopifyCheckoutUrl();
        window.open(url, '_blank', 'noopener,noreferrer');
        window.open(buildWhatsAppUrl(`${msg}\n\n✅ Pelanggan dibawa ke Shopify checkout.`), '_blank', 'noopener,noreferrer');
        setOrderConfirmed({ method: selectedPayment, total: snap });
      } catch (err) {
        window.alert(`Checkout gagal: ${err instanceof Error ? err.message : 'Ralat'}`);
      } finally { setIsProcessingPayment(false); }
      return;
    }
    if (selectedPayment === 'duitnow') {
      const payNote = [`📲 *Arahan DuitNow:*`, `🏦 ${BUSINESS_INFO.bank}`, `🔢 No. Akaun: ${BUSINESS_INFO.accountNo}`, `👤 ${BUSINESS_INFO.name}`, `💰 Jumlah: ${money(snap)}`, ``, `Hantar *screenshot bukti bayaran* dalam chat ini 🙏`].join('\n');
      window.open(buildWhatsAppUrl(`${msg}\n\n${payNote}`), '_blank', 'noopener,noreferrer');
      setOrderConfirmed({ method: selectedPayment, total: snap }); return;
    }
    if ((selectedPayment === 'shopify' || selectedPayment === 'fpx') && !canUseShopify) {
      window.open(buildWhatsAppUrl(`${msg}\n\n⚠️ Shopify belum aktif. Bayaran manual.`), '_blank', 'noopener,noreferrer');
      setOrderConfirmed({ method: 'whatsapp', total: snap }); return;
    }
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
    setOrderConfirmed({ method: selectedPayment, total: snap });
  };

  const copyAccountNumber = async () => {
    try { await navigator.clipboard.writeText(BUSINESS_INFO.accountNo); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { window.alert(`Salin: ${BUSINESS_INFO.accountNo}`); }
  };

  const scrollTo = (id: string) => {
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsSidebarOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#07101f_0%,#0b1830_50%,#08121d_100%)] text-foreground">

      {/* ══ SIDEBAR OVERLAY ═════════════════════════════════════════════════ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ══ SIDEBAR MENU ════════════════════════════════════════════════════ */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-hidden border-r border-white/10 bg-[#07101f]/95 backdrop-blur-xl transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundImage: 'url(/sidebar-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Sidebar overlay tint */}
        <div className="absolute inset-0 bg-[#07101f]/80" />

        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="logo-pulse overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-primary/30">
                <img src="/logo.png" alt="Izwan Systec" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <p className="font-heading text-sm font-black leading-tight">{BUSINESS_INFO.name}</p>
                <p className="text-[10px] text-muted-foreground">isystec.my</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav links — 3D button style */}
          <nav className="flex-1 space-y-2 p-4">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Navigasi</p>
            {SIDEBAR_LINKS.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="sidebar-btn group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-left font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0.5"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary shadow-md shadow-primary/20 transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-sm">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              );
            })}
          </nav>

          {/* Bottom: Cart quick access */}
          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => { setIsSidebarOpen(false); setIsCartOpen(true); }}
              className="btn-3d flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 font-bold text-primary-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              Troli {cartCount > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-black">{cartCount}</span>}
            </button>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">{BUSINESS_INFO.regNo} · {BUSINESS_INFO.businessNo}</p>
          </div>
        </div>
      </aside>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl"
        style={{ backgroundImage: 'url(/header-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
      >
        {/* Header content overlay */}
        <div className="absolute inset-0 bg-[#07101f]/75 backdrop-blur-sm" />

        <div className="container relative mx-auto flex h-20 items-center justify-between px-4">
          {/* Hamburger + Logo (bigger) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="group grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 transition hover:border-primary/40 hover:bg-primary/10"
              aria-label="Buka menu"
            >
              <div className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-foreground transition-all group-hover:w-6 group-hover:bg-primary" />
                <span className="h-0.5 w-6 rounded-full bg-foreground transition-all group-hover:bg-primary" />
                <span className="h-0.5 w-4 rounded-full bg-foreground transition-all group-hover:w-6 group-hover:bg-primary" />
              </div>
            </button>

            {/* BIGGER LOGO */}
            <div className="logo-pulse overflow-hidden rounded-2xl border border-white/15 shadow-xl shadow-primary/25">
              <img src="/logo.png" alt="Izwan Systec Enterprise" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-base font-black sm:text-lg">{BUSINESS_INFO.name}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {BUSINESS_INFO.regNo} · {BUSINESS_INFO.businessNo}
              </p>
            </div>
          </div>

          {/* Right: badges + cart */}
          <div className="flex items-center gap-3">
            <Badge className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-200 md:inline-flex">
              DuitNow + WhatsApp ✓
            </Badge>
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:border-primary/40 hover:bg-primary/10"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-14 md:py-24">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_right,rgba(50,147,255,0.20),transparent_38%),radial-gradient(circle_at_left,rgba(255,179,71,0.12),transparent_28%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            <div className="space-y-6">
              <Badge className="scroll-hidden rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                DuitNow + WhatsApp Order aktif sekarang
              </Badge>
              <div className="scroll-hidden space-y-4" data-delay="0.1s">
                <h1 className="max-w-3xl font-heading text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Izwan Systec — katalog, troli dan{' '}
                  <span className="text-primary">checkout sebenar</span> di satu halaman.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  Pilih produk, masukkan ke troli, pilih kaedah bayar dan hantar order terus ke WhatsApp admin.
                </p>
              </div>

              {/* Hero buttons — Katalog (3D) + Cara Pembayaran (image button) */}
              <div className="scroll-hidden flex flex-wrap items-center gap-4" data-delay="0.2s">
                <button
                  className="btn-3d inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Lihat Katalog <ArrowRight className="h-5 w-5" />
                </button>

                {/* Cara Pembayaran — IMAGE BUTTON */}
                <button
                  onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative h-16 transition-all duration-200 hover:-translate-y-1 hover:drop-shadow-[0_8px_24px_rgba(50,120,255,0.5)] active:translate-y-0.5"
                >
                  <img
                    src="/cara-pembayaran.png"
                    alt="Cara Pembayaran"
                    className="h-full w-auto max-w-[220px] object-contain"
                  />
                </button>
              </div>

              <div className="scroll-hidden grid gap-3 sm:grid-cols-3" data-delay="0.3s">
                {[
                  { value: '11',   label: 'produk dalam katalog dengan gambar sebenar' },
                  { value: '2',    label: 'kaedah bayar aktif sekarang (DuitNow + WA)' },
                  { value: 'CIMB', label: `akaun ${BUSINESS_INFO.accountNo} untuk terima bayaran` },
                ].map(item => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
                    <p className="font-heading text-3xl font-black text-amber-300">{item.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube autoplay */}
            <div className="scroll-hidden relative" data-delay="0.15s">
              <div className="yt-wrapper border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title="Izwan Systec — Solar Panel Video"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="absolute -left-3 bottom-6 rounded-3xl border border-white/10 bg-background/90 p-4 shadow-2xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment</p>
                <p className="mt-1 font-heading text-lg font-bold">DuitNow + WhatsApp + Shopify</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRODUCTS ════════════════════════════════════════════════════════ */}
        <section id="products" className="py-12">
          <div className="container mx-auto space-y-8 px-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="scroll-hidden space-y-3">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Katalog Produk</Badge>
                <h2 className="font-heading text-3xl font-black md:text-5xl">Produk solar, keselamatan & aksesori</h2>
              </div>
              <div className="scroll-hidden flex w-full flex-col gap-3 lg:max-w-md" data-delay="0.1s">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama produk, SKU atau kategori..."
                    className="h-12 rounded-full border-white/10 bg-white/5 pl-11" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ITEMS.map(cat => (
                    <Button key={cat.id} variant={activeCategory === cat.id ? 'default' : 'outline'}
                      className="rounded-full" onClick={() => setActiveCategory(cat.id)}>
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product, idx) => {
                const delays = ['0.05s','0.12s','0.19s','0.26s'];
                return (
                  <div key={product.id} className="scroll-hidden" data-delay={delays[idx % 4]}>
                    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-primary/10">
                      <div className="card-img-wrap">
                        <img src={product.image} alt={product.name} className="h-60 w-full object-cover" />
                        <Badge className="absolute left-4 top-4 z-10 rounded-full border-none bg-background/80 px-3 py-1 text-xs font-bold">{product.category}</Badge>
                        <Badge className="absolute bottom-4 left-4 z-10 rounded-full border-none bg-background/80 px-3 py-1 text-xs font-bold">{product.gallery.length} gambar</Badge>
                        <button className="absolute right-4 top-4 z-10 rounded-full bg-background/75 p-2 backdrop-blur transition hover:scale-110" onClick={() => toggleWishlist(product.id)}>
                          <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>
                      <CardContent className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <Badge variant="outline" className="rounded-full border-white/10 bg-transparent text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.badge}</Badge>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{product.sku}</span>
                        </div>
                        <h3 className="font-heading text-xl font-bold">{product.name}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{product.description}</p>
                        <div className="mt-4 flex gap-2 overflow-hidden">
                          {product.gallery.slice(0, 4).map((img, i) => (
                            <div key={`${product.id}-${i}`} className="thumb-img h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-background/60">
                              <img src={img} alt={`${product.name} ${i+1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {product.gallery.length > 4 && (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/10 bg-background/60 text-xs font-bold text-muted-foreground">+{product.gallery.length - 4}</div>
                          )}
                        </div>
                        <div className="mt-5 space-y-3">
                          <div className="flex items-end gap-3">
                            <span className="font-heading text-3xl font-black text-amber-300">{money(product.sellingPrice)}</span>
                            <span className="pb-1 text-xs text-muted-foreground line-through">{money(product.costPrice)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{product.stockLabel}</span>
                            <span>{product.shopifyVariantId ? '✅ Shopify' : '💬 WA order'}</span>
                          </div>
                          <div className="grid gap-2">
                            <button className="btn-3d flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
                              onClick={() => addToCart(product)}>Tambah ke Troli</button>
                            <button className="btn-3d-outline flex h-11 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-sm font-bold backdrop-blur"
                              onClick={() => { addToCart(product); setSelectedPayment('duitnow'); setIsCheckoutOpen(true); }}>Beli Sekarang</button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ PAYMENT SECTION ═════════════════════════════════════════════════ */}
        <section id="payment" className="py-16">
          <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="scroll-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
              <CardContent className="p-6 md:p-8">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Kaedah Pembayaran</Badge>
                <h2 className="mt-4 font-heading text-3xl font-black md:text-4xl">Bayar dengan cara yang paling selesa</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">DuitNow dan WhatsApp order sudah berfungsi sekarang.</p>
                <div className="mt-8 grid gap-4">
                  {PAYMENT_OPTIONS.map(opt => {
                    const Icon = PAYMENT_ICONS[opt.id as PaymentMethod];
                    const ok = opt.status === 'Sedia';
                    return (
                      <div key={opt.id} className={`grid gap-4 rounded-[1.5rem] border p-5 transition md:grid-cols-[auto_1fr_auto] md:items-center ${ok ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-white/10 bg-background/50'}`}>
                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-primary/10 text-primary'}`}><Icon className="h-5 w-5" /></div>
                        <div><p className="font-heading text-lg font-bold">{opt.title}</p><p className="text-sm text-muted-foreground">{opt.description}</p></div>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-bold ${ok ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>{opt.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="scroll-hidden rounded-[2rem] border border-emerald-400/20 bg-emerald-400/5 shadow-2xl shadow-black/20" data-delay="0.1s">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">DuitNow / Bank Transfer</p>
                  </div>
                  <h3 className="mt-2 font-heading text-2xl font-black">Scan & Bayar Terus</h3>
                  <div className="mt-4 flex flex-col items-center gap-4">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/60 p-2">
                      <img src={getDuitNowQrUrl(200)} alt="QR Code DuitNow CIMB" className="h-40 w-40 rounded-xl" width={160} height={160} />
                    </div>
                    <div className="w-full text-center">
                      <p className="text-xs text-muted-foreground">{BUSINESS_INFO.bank}</p>
                      <p className="font-heading text-4xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{BUSINESS_INFO.name}</p>
                    </div>
                  </div>
                  <button
                    className={`btn-3d-outline mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border font-bold text-sm ${copied ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/20 bg-white/5'}`}
                    onClick={copyAccountNumber}
                  >
                    <Copy className="h-4 w-4" />{copied ? '✓ Nombor Disalin!' : 'Salin Nombor Akaun'}
                  </button>
                </CardContent>
              </Card>

              <Card className="scroll-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20" data-delay="0.2s">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Configurasi</p>
                  <h3 className="mt-3 font-heading text-2xl font-black">WhatsApp & Shopify</h3>
                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                    {[
                      { key: 'VITE_WHATSAPP_NUMBER', desc: '+6017-4511455 ✓ Sudah dikonfigurasi' },
                      { key: 'VITE_SHOPIFY_STORE_URL', desc: 'URL store Shopify anda' },
                      { key: 'VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN', desc: 'Token dari Shopify Admin' },
                    ].map(({ key, desc }) => (
                      <div key={key} className="rounded-2xl border border-white/10 bg-background/50 p-3">
                        <p className="font-mono text-xs font-bold text-foreground">{key}</p>
                        <p className="mt-0.5 text-xs">{desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
        <section className="py-8">
          <div className="container mx-auto grid gap-4 px-4 md:grid-cols-3">
            {TESTIMONIALS.map((item, i) => (
              <div key={item.name} className="scroll-hidden" data-delay={`${i * 0.08}s`}>
                <Card className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1 text-amber-300">{[0,1,2,3,4].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}</div>
                    <p className="text-sm leading-7 text-muted-foreground">"{item.quote}"</p>
                    <p className="mt-5 font-heading text-lg font-bold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CONTACT ═════════════════════════════════════════════════════════ */}
        <section id="contact" className="py-16">
          <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[1fr_0.9fr]">
            <Card className="scroll-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
              <CardContent className="p-6 md:p-8">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Hubungi Kami</Badge>
                <h2 className="mt-4 font-heading text-3xl font-black md:text-4xl">Hubungi admin terus</h2>
                <div className="mt-6 grid gap-4">
                  {[
                    { icon: Mail,         label: 'Emel',              value: BUSINESS_INFO.email },
                    { icon: Phone,        label: 'Telefon / WA',      value: '+6017-4511455' },
                    { icon: CheckCircle2, label: 'Nombor Perniagaan', value: `${BUSINESS_INFO.regNo} / ${BUSINESS_INFO.businessNo}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-[1.5rem] border border-white/10 bg-background/50 p-5">
                      <p className="flex items-center gap-2 font-bold"><Icon className="h-4 w-4 text-primary" />{label}</p>
                      <p className="mt-2 text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="scroll-hidden rounded-[2rem] border border-white/10 bg-primary text-primary-foreground shadow-2xl shadow-primary/25" data-delay="0.1s">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground/75">Deploy</p>
                <h3 className="mt-3 font-heading text-3xl font-black">GitHub siap untuk push</h3>
                <p className="mt-4 text-sm leading-7 text-primary-foreground/80">
                  Domain isystec.my menggunakan Hostinger. Upload via FTP/SFTP atau aktifkan GitHub Actions untuk auto-deploy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer
        className="relative border-t border-white/10"
        style={{ backgroundImage: 'url(/footer-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#07101f]/82" />
        <div className="relative container mx-auto px-4 py-12">
          {/* 4-column footer grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Izwan Systec" className="h-14 w-14 rounded-xl object-contain" />
                <div>
                  <p className="font-heading text-lg font-black">IzwanSystec</p>
                  <p className="text-xs text-muted-foreground">isystec.my</p>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground">Innovating Systems,<br />Empowering Technology</p>
              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  { icon: IconFacebook,  href: '#', label: 'Facebook' },
                  { icon: IconTwitter,   href: '#', label: 'Twitter' },
                  { icon: IconLinkedin,  href: '#', label: 'LinkedIn' },
                  { icon: IconInstagram, href: '#', label: 'Instagram' },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Links</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[['Home','top'],['Katalog','products'],['Cara Bayar','payment'],['Hubungi','contact']].map(([label, id]) => (
                  <li key={id}>
                    <button onClick={() => scrollTo(id)} className="flex items-center gap-2 transition hover:text-primary">
                      <span className="h-1 w-1 rounded-full bg-primary" />{label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact Us</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{BUSINESS_INFO.email}</li>
                <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />+6017-4511455</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-primary">📍</span>Kuala Lumpur, Malaysia</li>
              </ul>
            </div>

            {/* Payment / Bank */}
            <div>
              <p className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-muted-foreground">Bayaran</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-bold text-foreground">{BUSINESS_INFO.bank}</p>
                <p className="font-heading text-2xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                <p>{BUSINESS_INFO.name}</p>
                <button
                  onClick={copyAccountNumber}
                  className={`mt-2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${copied ? 'border-emerald-400/40 text-emerald-300' : 'border-white/15 hover:border-primary/40 hover:text-primary'}`}
                >
                  <Copy className="h-3 w-3" />{copied ? '✓ Disalin!' : 'Salin Akaun'}
                </button>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <VisitorCounter />
            <p>© 2026 {BUSINESS_INFO.name}. All rights reserved.</p>
            <p className="text-right">{BUSINESS_INFO.regNo} · {BUSINESS_INFO.businessNo}</p>
          </div>
        </div>
      </footer>

      {/* ══ CART SHEET ══════════════════════════════════════════════════════ */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Troli Pelanggan</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <ScrollArea className="flex-1 pr-1">
            {cart.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">Troli masih kosong</p>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 rounded-3xl border border-white/10 bg-background/50 p-3">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-white/10">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.id,-1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQty(item.id,1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-heading text-lg font-black text-amber-300">{money(item.quantity * item.sellingPrice)}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {cart.length > 0 && (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-heading text-2xl font-black text-amber-300">{money(cartTotal)}</span>
              </div>
              <button
                className="btn-3d flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground"
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
              >Teruskan ke Checkout</button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ══ CHECKOUT DIALOG ═════════════════════════════════════════════════ */}
      <Dialog open={isCheckoutOpen} onOpenChange={open => {
        if (!open) { if (orderConfirmed) finalizeOrder(); else setIsCheckoutOpen(false); }
        else setIsCheckoutOpen(true);
      }}>
        <DialogContent className="max-h-[92vh] overflow-auto border-white/10 bg-background sm:max-w-3xl">
          {orderConfirmed ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl"><CheckCircle2 className="h-6 w-6 text-emerald-400" />Pesanan Diterima!</DialogTitle>
                <DialogDescription>{orderConfirmed.method === 'duitnow' ? 'Sila bayar ke akaun CIMB dan hantar bukti melalui WhatsApp yang dah dibuka.' : 'Pesanan telah dihantar. Admin akan menghubungi anda tidak lama lagi.'}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-5 py-2">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><CheckCircle2 className="h-12 w-12" /></div>
                <div className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-sm text-muted-foreground">Jumlah Pesanan</p>
                  <p className="font-heading text-4xl font-black text-amber-300">{money(orderConfirmed.total)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">via {PAYMENT_LABELS[orderConfirmed.method]}</p>
                </div>
                {orderConfirmed.method === 'duitnow' && (
                  <div className="w-full space-y-4 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/5 p-5">
                    <p className="font-heading text-lg font-bold text-emerald-300">Arahan DuitNow</p>
                    <div className="flex justify-center">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/60 p-2">
                        <img src={getDuitNowQrUrl(200)} alt="DuitNow QR" className="h-40 w-40 rounded-xl" width={160} height={160} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{BUSINESS_INFO.bank}</p>
                      <p className="font-heading text-3xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                      <p className="text-sm text-muted-foreground">{BUSINESS_INFO.name}</p>
                    </div>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {[
                        'Buka apl perbankan (Maybank2u, CIMB Clicks, dll.)',
                        'Pilih DuitNow Transfer atau Interbank Transfer',
                        `Masukkan akaun CIMB: ${BUSINESS_INFO.accountNo}`,
                        `Transfer ${money(orderConfirmed.total)} dan hantar screenshot dalam WhatsApp.`,
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{i+1}</span>{step}
                        </li>
                      ))}
                    </ol>
                    <button
                      className={`btn-3d-outline flex h-11 w-full items-center justify-center gap-2 rounded-2xl border font-bold text-sm ${copied ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300':'border-white/20 bg-white/5'}`}
                      onClick={copyAccountNumber}
                    ><Copy className="h-4 w-4" />{copied ? '✓ Disalin!' : 'Salin Nombor Akaun CIMB'}</button>
                  </div>
                )}
                <button className="btn-3d flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground" onClick={finalizeOrder}>
                  Selesai — Tutup
                </button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl"><CreditCard className="h-5 w-5 text-primary" />Checkout & Pembayaran</DialogTitle>
                <DialogDescription>Pilih kaedah bayaran dan lengkapkan maklumat pelanggan.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <h3 className="font-heading text-lg font-bold">Ringkasan Pesanan</h3>
                  <div className="mt-4 space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between border-b border-white/10 pb-3 text-sm">
                        <span>{item.name} x{item.quantity}</span><span>{money(item.sellingPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between font-heading text-lg font-black text-amber-300"><span>Jumlah</span><span>{money(cartTotal)}</span></div>
                  {selectedPayment === 'duitnow' ? (
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-center">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Scan QR untuk bayar</p>
                      <div className="flex justify-center"><img src={getDuitNowQrUrl(180)} alt="DuitNow QR" className="h-32 w-32 rounded-xl border border-white/10" /></div>
                      <p className="mt-2 text-xs text-muted-foreground">{BUSINESS_INFO.bank}</p>
                      <p className="font-heading text-xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-3xl border border-primary/20 bg-primary/10 p-4 text-sm">
                      <p className="font-bold text-foreground">Akaun pembayaran manual</p>
                      <p className="mt-1 text-muted-foreground">{BUSINESS_INFO.bank}</p>
                      <p className="font-heading text-2xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                    </div>
                  )}
                </div>
                <form className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={proceedPayment}>
                  <div className="grid gap-4">
                    <div className="grid gap-2"><Label htmlFor="buyerName">Nama Penuh</Label><Input id="buyerName" value={customer.name} onChange={e=>setCustomer(c=>({...c,name:e.target.value}))} placeholder="cth: Ahmad bin Ali" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2"><Label htmlFor="buyerPhone">Telefon / WA</Label><Input id="buyerPhone" value={customer.phone} onChange={e=>setCustomer(c=>({...c,phone:e.target.value}))} placeholder="0123456789" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                      <div className="grid gap-2"><Label htmlFor="buyerEmail">Emel</Label><Input id="buyerEmail" value={customer.email} onChange={e=>setCustomer(c=>({...c,email:e.target.value}))} placeholder="nama@email.com" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                    </div>
                    <div className="grid gap-2"><Label htmlFor="buyerAddress">Alamat Penghantaran</Label><Textarea id="buyerAddress" value={customer.address} onChange={e=>setCustomer(c=>({...c,address:e.target.value}))} placeholder="Alamat lengkap termasuk poskod dan negeri" className="min-h-[80px] rounded-[1.25rem] border-white/10 bg-background/60" /></div>
                    <div className="grid gap-3">
                      <Label>Kaedah Pembayaran</Label>
                      {PAYMENT_OPTIONS.map(opt => {
                        const pid=opt.id as PaymentMethod, Icon=PAYMENT_ICONS[pid], ok=opt.status==='Sedia', sel=selectedPayment===pid;
                        return (
                          <label key={opt.id} className={`flex cursor-pointer gap-3 rounded-[1.25rem] border p-3.5 transition ${sel?'border-primary bg-primary/10':ok?'border-emerald-400/20 bg-emerald-400/5':'border-white/10 bg-background/50'}`}>
                            <input type="radio" name="paymentMethod" value={pid} checked={sel} onChange={()=>setSelectedPayment(pid)} className="mt-1" />
                            <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${ok?'bg-emerald-500/15 text-emerald-300':'bg-primary/10 text-primary'}`}><Icon className="h-4 w-4" /></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">{opt.title}</p>
                                {ok&&<Badge className="rounded-full bg-emerald-500/15 px-2 py-0 text-[10px] text-emerald-300">Sedia</Badge>}
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="grid gap-2"><Label htmlFor="buyerNote">Nota Tambahan</Label><Textarea id="buyerNote" value={customer.note} onChange={e=>setCustomer(c=>({...c,note:e.target.value}))} placeholder="self pickup / mahu invoice / sudah bayar DuitNow" className="min-h-[72px] rounded-[1.25rem] border-white/10 bg-background/60" /></div>
                    <div className="rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4 text-sm">
                      {selectedPayment==='shopify'||selectedPayment==='fpx' ? (canUseShopify?<p>Shopify checkout live.</p>:<p className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400"/><span>Shopify belum aktif. Order dihantar via WhatsApp.</span></p>) : selectedPayment==='duitnow'?<p>WhatsApp dibuka dengan arahan transfer ke CIMB <strong>{BUSINESS_INFO.accountNo}</strong>.</p>:<p>Pesanan dihantar ke WhatsApp admin.</p>}
                    </div>
                  </div>
                  <DialogFooter className="mt-5 flex-col gap-2 sm:flex-col">
                    <button type="submit" disabled={isProcessingPayment}
                      className="btn-3d flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60">
                      {isProcessingPayment ? 'Memproses...' : 'Teruskan Pembayaran →'}
                    </button>
                    <button type="button"
                      className={`btn-3d-outline flex h-12 w-full items-center justify-center gap-2 rounded-2xl border font-bold text-sm ${copied?'border-emerald-400/40 bg-emerald-400/10 text-emerald-300':'border-white/20 bg-white/5'}`}
                      onClick={copyAccountNumber}>
                      <Copy className="h-4 w-4" />{copied ? '✓ Disalin!' : 'Salin Akaun CIMB'}
                    </button>
                  </DialogFooter>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ FLOATING WIDGETS ═══════════════════════════════ */}
      <Chatbot />
      <AIMonitor />
    </div>
  );
}
