
import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Copy, CreditCard, Heart, Mail, Menu, Minus, Phone, Search, ShoppingCart, Smartphone, Star, SunMedium, Trash2, Plus, Wallet, X } from 'lucide-react';
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

const CATEGORY_ITEMS: Array<{ id: Category | 'All'; label: string; description: string; icon: typeof SunMedium }> = [
  { id: 'All', label: 'Semua Produk', description: 'Semua item katalog yang aktif.', icon: Wallet },
  { id: 'Security', label: 'Security', description: 'Kamera, siren dan sensor.', icon: ShoppingCart },
  { id: 'Solar', label: 'Solar', description: 'Panel, controller dan bateri.', icon: SunMedium },
  { id: 'Accessories', label: 'Accessories', description: 'Kabel, switch dan hardware.', icon: Wallet },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  shopify: 'Shopify Checkout',
  fpx: 'FPX / Debit / Credit Card',
  duitnow: 'DuitNow QR / Bank Transfer',
  whatsapp: 'WhatsApp Confirmation',
};

const PAYMENT_ICONS = {
  shopify: ShoppingCart,
  fpx: CreditCard,
  duitnow: Smartphone,
  whatsapp: Wallet,
} as const;

const money = (value: number) => `RM ${value.toFixed(2)}`;

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('shopify');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', note: '' });

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = !query || [product.name, product.description, product.sku, product.category].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const canUseShopifyCheckout = Boolean(BUSINESS_INFO.shopifyStoreUrl) && cart.length > 0 && cart.every((item) => item.shopifyVariantId);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => setCart((current) => current.filter((item) => item.id !== productId));
  const updateQuantity = (productId: string, delta: number) => setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const toggleWishlist = (productId: string) => setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);

  const buildShopifyUrl = () => `${BUSINESS_INFO.shopifyStoreUrl}${BUSINESS_INFO.shopifyCartPath}${cart.map((item) => `${item.shopifyVariantId}:${item.quantity}`).join(',')}`;
  const buildWhatsAppUrl = (message: string) => `${BUSINESS_INFO.whatsappNumber.replace(/\D/g, '') ? `https://wa.me/${BUSINESS_INFO.whatsappNumber.replace(/\D/g, '')}` : BUSINESS_INFO.whatsappLinkFallback}?text=${encodeURIComponent(message)}`;

  const buildOrderMessage = (method: PaymentMethod) => {
    const lines = cart.map((item) => `- ${item.name} x${item.quantity} = ${money(item.quantity * item.sellingPrice)}`).join('\n');
    return [
      `Pesanan Baru - ${BUSINESS_INFO.name}`,
      '',
      `Nama: ${customer.name}`,
      `Telefon: ${customer.phone}`,
      `Emel: ${customer.email || '-'}`,
      `Alamat: ${customer.address}`,
      `Kaedah Bayaran: ${PAYMENT_LABELS[method]}`,
      `Nota: ${customer.note || '-'}`,
      '',
      'Senarai Produk:',
      lines,
      '',
      `Jumlah: ${money(cartTotal)}`,
      `Bank: ${BUSINESS_INFO.bank}`,
      `No. Akaun: ${BUSINESS_INFO.accountNo}`,
    ].join('\n');
  };

  const clearOrderState = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setCustomer({ name: '', phone: '', email: '', address: '', note: '' });
  };

  const proceedPayment = (event: FormEvent) => {
    event.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      window.alert('Isi nama, telefon dan alamat penghantaran dahulu.');
      return;
    }

    const orderMessage = buildOrderMessage(selectedPayment);
    if ((selectedPayment === 'shopify' || selectedPayment === 'fpx') && canUseShopifyCheckout) {
      window.open(buildShopifyUrl(), '_blank', 'noopener,noreferrer');
      window.open(buildWhatsAppUrl(`${orderMessage}\n\nPelanggan telah dibawa ke Shopify checkout.`), '_blank', 'noopener,noreferrer');
      clearOrderState();
      return;
    }

    if (selectedPayment === 'duitnow') {
      const duitNowNote = BUSINESS_INFO.duitNowQrUrl ? `QR DuitNow: ${BUSINESS_INFO.duitNowQrUrl}` : `Bayar ke ${BUSINESS_INFO.bank} ${BUSINESS_INFO.accountNo} dan hantar bukti bayaran.`;
      window.open(buildWhatsAppUrl(`${orderMessage}\n\nArahan pembayaran:\n${duitNowNote}`), '_blank', 'noopener,noreferrer');
      clearOrderState();
      return;
    }

    if ((selectedPayment === 'shopify' || selectedPayment === 'fpx') && !canUseShopifyCheckout) {
      window.alert('Shopify checkout belum lengkap. Pesanan akan dihantar melalui WhatsApp sebagai fallback.');
    }

    window.open(buildWhatsAppUrl(orderMessage), '_blank', 'noopener,noreferrer');
    clearOrderState();
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(BUSINESS_INFO.accountNo);
      window.alert('Nombor akaun disalin.');
    } catch {
      window.alert(`Salin nombor akaun ini: ${BUSINESS_INFO.accountNo}`);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#07101f_0%,#0b1830_50%,#08121d_100%)] text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary font-black text-primary-foreground shadow-lg shadow-primary/30">IS</div>
            <div>
              <p className="font-heading text-sm font-bold sm:text-base">{BUSINESS_INFO.name}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{BUSINESS_INFO.regNo} · {BUSINESS_INFO.businessNo}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Katalog</button>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })}>Payment</button>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Hubungi</button>
          </nav>

          <div className="flex items-center gap-2">
            <Badge className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-200 md:inline-flex">Checkout online-ready</Badge>
            <Button variant="outline" size="icon" className="relative rounded-full" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">{cartCount}</span>}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setIsMobileMenuOpen((value) => !value)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="container mx-auto grid gap-2">
              <Button variant="ghost" className="justify-start" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Katalog</Button>
              <Button variant="ghost" className="justify-start" onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })}>Payment</Button>
              <Button variant="ghost" className="justify-start" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Hubungi</Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_right,rgba(50,147,255,0.20),transparent_38%),radial-gradient(circle_at_left,rgba(255,179,71,0.12),transparent_28%)]" />
          <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">Gambar katalog sebenar + payment flow yang lebih siap</Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-heading text-4xl font-black leading-tight tracking-tight md:text-6xl">Website Izwan Systec kini lebih <span className="text-primary">siap jualan</span> untuk katalog, troli dan checkout.</h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">Halaman ini guna gambar produk dari katalog tempatan, tambah pilihan Shopify checkout, FPX/kad, DuitNow dan WhatsApp order supaya pelanggan nampak aliran pembelian yang lebih meyakinkan.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Lihat Katalog <ArrowRight className="ml-2 h-5 w-5" /></Button>
                <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base font-bold" onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })}>Semak Payment Setup</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[{ value: '11', label: 'produk dimuat dengan gambar katalog tempatan' }, { value: '4', label: 'cara bayaran dipaparkan jelas untuk pelanggan' }, { value: '1', label: 'tempat khusus untuk sambungan Shopify sebenar' }].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
                    <p className="font-heading text-3xl font-black text-amber-300">{item.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_30px_90px_rgba(0,0,0,0.35)]"><img src="/catalog/solar-panel/solar-panel.jpg" alt="Katalog panel solar" className="h-[500px] w-full object-cover" /></div>
              <div className="absolute -left-3 bottom-6 rounded-3xl border border-white/10 bg-background/90 p-4 shadow-2xl backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment</p><p className="mt-1 font-heading text-lg font-bold">Shopify + DuitNow + WhatsApp</p></div>
            </div>
          </div>
        </section>

        <section id="products" className="py-12">
          <div className="container mx-auto space-y-8 px-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Katalog Produk</Badge>
                <h2 className="font-heading text-3xl font-black md:text-5xl">Produk utama untuk solar, keselamatan dan aksesori pemasangan</h2>
                <p className="max-w-2xl text-muted-foreground">Semua kad produk di bawah menggunakan galeri katalog anda sendiri dan dipersembahkan dengan thumbnail strip supaya rasa lebih dekat dengan listing Shopee.</p>
              </div>
              <div className="flex w-full flex-col gap-3 lg:max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari nama produk, SKU atau kategori..." className="h-12 rounded-full border-white/10 bg-white/5 pl-11" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ITEMS.map((category) => (
                    <Button key={category.id} variant={activeCategory === category.id ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveCategory(category.id)}>{category.label}</Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                  <div className="relative overflow-hidden">
                    <img src={product.image} alt={product.name} className="h-60 w-full object-cover" />
                    <Badge className="absolute left-4 top-4 rounded-full border-none bg-background/80 px-3 py-1 text-xs font-bold">{product.category}</Badge>
                    <Badge className="absolute bottom-4 left-4 rounded-full border-none bg-background/80 px-3 py-1 text-xs font-bold">{product.gallery.length} gambar</Badge>
                    <button className="absolute right-4 top-4 rounded-full bg-background/75 p-2 text-foreground backdrop-blur transition hover:scale-105" onClick={() => toggleWishlist(product.id)}>
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
                      {product.gallery.slice(0, 4).map((image, index) => (
                        <div key={`${product.id}-${index}`} className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-background/60">
                          <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {product.gallery.length > 4 && (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/10 bg-background/60 text-xs font-bold text-muted-foreground">
                          +{product.gallery.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-end gap-3">
                        <span className="font-heading text-3xl font-black text-amber-300">{money(product.sellingPrice)}</span>
                        <span className="pb-1 text-xs text-muted-foreground line-through">{money(product.costPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{product.stockLabel}</span>
                        <span>{product.shopifyVariantId ? 'Shopify linked' : 'Perlu Shopify variant ID'}</span>
                      </div>
                      <div className="grid gap-2">
                        <Button className="h-11 rounded-2xl font-bold" onClick={() => addToCart(product)}>Tambah ke Troli</Button>
                        <Button variant="outline" className="h-11 rounded-2xl font-bold" onClick={() => { addToCart(product); setSelectedPayment(product.shopifyVariantId ? 'shopify' : 'whatsapp'); setIsCheckoutOpen(true); }}>Beli Sekarang</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="payment" className="py-16">
          <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
              <CardContent className="p-6 md:p-8">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Payment Setup</Badge>
                <h2 className="mt-4 font-heading text-3xl font-black md:text-4xl">Pilihan pembayaran pelanggan kini lebih jelas di halaman utama</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">Saya sediakan aliran yang sesuai untuk storefront statik hari ini, sambil tinggalkan struktur untuk sambungan Shopify checkout sebenar bila store URL dan variant ID sudah tersedia.</p>
                <div className="mt-8 grid gap-4">
                  {PAYMENT_OPTIONS.map((option) => {
                    const Icon = PAYMENT_ICONS[option.id as PaymentMethod];
                    return (
                      <div key={option.id} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-background/50 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                        <div><p className="font-heading text-lg font-bold">{option.title}</p><p className="text-sm text-muted-foreground">{option.description}</p></div>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-bold ${option.status === 'Sedia' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>{option.status}</Badge>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-amber-300/15 bg-amber-300/10 p-5 text-sm text-amber-100">
                  <p className="font-bold">Nota penting</p>
                  <p className="mt-2">Shopify payment live belum boleh diproses tanpa `shopifyStoreUrl` dan `shopifyVariantId` untuk setiap produk. Saya sudah sediakan struktur fallback supaya order masih boleh ditutup melalui WhatsApp, DuitNow dan bank transfer.</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Apa perlu diisi nanti</p>
                  <h3 className="mt-3 font-heading text-2xl font-black">Konfigurasi Shopify</h3>
                  <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-white/10 bg-background/50 p-4"><p className="font-bold text-foreground">`shopifyStoreUrl`</p><p className="mt-1">Contoh: `https://nama-store.myshopify.com`</p></div>
                    <div className="rounded-2xl border border-white/10 bg-background/50 p-4"><p className="font-bold text-foreground">`shopifyVariantId`</p><p className="mt-1">Isi variant ID produk sebenar untuk bina cart permalink.</p></div>
                    <div className="rounded-2xl border border-white/10 bg-background/50 p-4"><p className="font-bold text-foreground">Gateway payment</p><p className="mt-1">Aktifkan FPX, debit dan kredit di Shopify admin atau gateway pilihan anda.</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Bank Transfer</p>
                  <h3 className="mt-3 font-heading text-2xl font-black">{BUSINESS_INFO.bank}</h3>
                  <p className="mt-2 font-heading text-4xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{BUSINESS_INFO.name}</p>
                  <Button variant="outline" className="mt-5 w-full rounded-2xl font-bold" onClick={copyAccountNumber}><Copy className="mr-2 h-4 w-4" />Salin Nombor Akaun</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto grid gap-4 px-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Card key={item.name} className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1 text-amber-300">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
                  <p className="text-sm leading-7 text-muted-foreground">"{item.quote}"</p>
                  <p className="mt-5 font-heading text-lg font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="contact" className="py-16">
          <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[1fr_0.9fr]">
            <Card className="rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
              <CardContent className="p-6 md:p-8">
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">Hubungi Kami</Badge>
                <h2 className="mt-4 font-heading text-3xl font-black md:text-4xl">Masih boleh closing sale secara manual jika payment gateway belum live</h2>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-background/50 p-5"><p className="flex items-center gap-2 font-bold"><Mail className="h-4 w-4 text-primary" /> Emel</p><p className="mt-2 text-muted-foreground">{BUSINESS_INFO.email}</p></div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-background/50 p-5"><p className="flex items-center gap-2 font-bold"><Phone className="h-4 w-4 text-primary" /> Telefon / WhatsApp</p><p className="mt-2 text-muted-foreground">{BUSINESS_INFO.phone}</p></div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-background/50 p-5"><p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4 text-primary" /> Nombor Perniagaan</p><p className="mt-2 text-muted-foreground">{BUSINESS_INFO.regNo} / {BUSINESS_INFO.businessNo}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border border-white/10 bg-primary text-primary-foreground shadow-2xl shadow-primary/25">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground/75">Deploy note</p>
                <h3 className="mt-3 font-heading text-3xl font-black">GitHub siap untuk push, server perlukan sambungan hosting sebenar</h3>
                <p className="mt-4 text-sm leading-7 text-primary-foreground/80">Domain `isystec.my` sekarang memberi header `HostingerWebsiteBuilder`, jadi auto upload terus ke server tidak boleh saya jalankan sepenuhnya tanpa akses hosting atau secret deploy. Saya boleh sediakan workflow deploy siap, tetapi akaun Hostinger / FTP / SFTP masih perlu disambungkan.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto flex flex-col gap-3 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 {BUSINESS_INFO.name}. Storefront katalog dengan checkout online-ready.</p>
          <p>Shopify placeholder + bank transfer + WhatsApp order flow</p>
        </div>
      </footer>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Troli Pelanggan</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <ScrollArea className="-mx-6 flex-1 px-6">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center"><ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/30" /><p className="font-medium text-muted-foreground">Troli masih kosong</p></div>
            ) : (
              <div className="space-y-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-3xl border border-white/10 bg-background/50 p-3">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-white/10">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="text-right"><p className="font-heading text-lg font-black text-amber-300">{money(item.quantity * item.sellingPrice)}</p></div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {cart.length > 0 && (
            <div className="space-y-4 pt-4">
              <Separator />
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Jumlah</span><span className="font-heading text-2xl font-black text-amber-300">{money(cartTotal)}</span></div>
              <Button className="h-12 w-full rounded-2xl text-base font-bold" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>Teruskan ke Checkout</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto border-white/10 bg-background sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl"><CreditCard className="h-5 w-5 text-primary" />Checkout & Pembayaran</DialogTitle>
            <DialogDescription>Pilih kaedah bayaran dan lengkapkan maklumat pelanggan sebelum teruskan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <h3 className="font-heading text-lg font-bold">Ringkasan Pesanan</h3>
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm"><span>{item.name} x{item.quantity}</span><span>{money(item.sellingPrice * item.quantity)}</span></div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between font-heading text-lg font-black text-amber-300"><span>Jumlah</span><span>{money(cartTotal)}</span></div>
              <div className="mt-5 rounded-3xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary-foreground"><p className="font-bold text-foreground">Akaun pembayaran manual</p><p className="mt-2 text-muted-foreground">{BUSINESS_INFO.bank}</p><p className="font-heading text-2xl font-black text-amber-300">{BUSINESS_INFO.accountNo}</p></div>
            </div>

            <form className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={proceedPayment}>
              <div className="grid gap-4">
                <div className="grid gap-2"><Label htmlFor="buyerName">Nama Penuh</Label><Input id="buyerName" value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} placeholder="cth: Ahmad bin Ali" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2"><Label htmlFor="buyerPhone">Telefon / WhatsApp</Label><Input id="buyerPhone" value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} placeholder="cth: 0123456789" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                  <div className="grid gap-2"><Label htmlFor="buyerEmail">Emel</Label><Input id="buyerEmail" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} placeholder="cth: nama@email.com" className="h-11 rounded-2xl border-white/10 bg-background/60" /></div>
                </div>
                <div className="grid gap-2"><Label htmlFor="buyerAddress">Alamat Penghantaran</Label><Textarea id="buyerAddress" value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} placeholder="Masukkan alamat lengkap termasuk poskod dan negeri" className="min-h-[96px] rounded-[1.25rem] border-white/10 bg-background/60" /></div>
                <div className="grid gap-3">
                  <Label>Kaedah Pembayaran</Label>
                  {PAYMENT_OPTIONS.map((option) => {
                    const paymentId = option.id as PaymentMethod;
                    const Icon = PAYMENT_ICONS[paymentId];
                    return (
                      <label key={option.id} className={`flex cursor-pointer gap-3 rounded-[1.25rem] border p-4 transition ${selectedPayment === paymentId ? 'border-primary bg-primary/10' : 'border-white/10 bg-background/50'}`}>
                        <input type="radio" name="paymentMethod" value={paymentId} checked={selectedPayment === paymentId} onChange={() => setSelectedPayment(paymentId)} className="mt-1" />
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                        <div className="space-y-1"><p className="font-bold">{option.title}</p><p className="text-sm text-muted-foreground">{option.description}</p></div>
                      </label>
                    );
                  })}
                </div>
                <div className="grid gap-2"><Label htmlFor="buyerNote">Nota Tambahan</Label><Textarea id="buyerNote" value={customer.note} onChange={(event) => setCustomer((current) => ({ ...current, note: event.target.value }))} placeholder="Contoh: self pickup / mahu invoice / sudah bayar DuitNow" className="min-h-[88px] rounded-[1.25rem] border-white/10 bg-background/60" /></div>
                <div className="rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4 text-sm">
                  {selectedPayment === 'shopify' || selectedPayment === 'fpx' ? (canUseShopifyCheckout ? <p>Shopify checkout sedia dibuka dalam tab baru untuk item yang sudah dipautkan.</p> : <p>Shopify checkout belum lengkap. Isi `shopifyStoreUrl` dan `shopifyVariantId` untuk semua item jika mahu bayaran live.</p>) : selectedPayment === 'duitnow' ? <p>Pelanggan akan dihantar ke WhatsApp dengan arahan bayar ke {BUSINESS_INFO.bank} {BUSINESS_INFO.accountNo}.</p> : <p>Pesanan lengkap akan dihantar terus ke WhatsApp admin untuk semakan manual.</p>}
                </div>
              </div>
              <DialogFooter className="mt-6 flex-col gap-2 sm:flex-col">
                <Button type="submit" className="h-12 w-full rounded-2xl text-base font-bold">Teruskan Pembayaran</Button>
                <Button type="button" variant="outline" className="h-12 w-full rounded-2xl font-bold" onClick={copyAccountNumber}><Copy className="mr-2 h-4 w-4" />Salin Akaun CIMB</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
