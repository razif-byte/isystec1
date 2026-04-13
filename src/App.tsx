/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Shield, 
  Sun, 
  Settings, 
  Search, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  ArrowRight,
  Heart,
  User,
  LogOut,
  Package,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PRODUCTS, BUSINESS_INFO } from './constants';
import { Product, CartItem, Category } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || 
                           p.description.toLowerCase().includes(q) ||
                           p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Information
            </DialogTitle>
            <DialogDescription>
              Please complete your payment to the following account and send the receipt to our WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 p-6 rounded-2xl border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="font-bold">{BUSINESS_INFO.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account No</span>
              <span className="font-mono font-bold text-lg">{BUSINESS_INFO.accountNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Name</span>
              <span className="font-medium text-xs text-right">{BUSINESS_INFO.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="font-bold text-xl text-primary">RM {cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button className="w-full h-12 font-bold" onClick={() => {
              setCart([]);
              setIsCheckoutOpen(false);
            }}>
              Done & Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wishlist Sheet */}
      <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
              Your Wishlist
            </SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <ScrollArea className="flex-1 -mx-6 px-6">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">Your wishlist is empty</p>
                <Button variant="link" onClick={() => setIsWishlistOpen(false)}>Browse products</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {wishlistProducts.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">RM {item.sellingPrice.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => addToCart(item)}>
                          Add to Cart
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toggleWishlist(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              IS
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">{BUSINESS_INFO.name}</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{BUSINESS_INFO.regNo}</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => setActiveCategory('All')} className={`text-sm font-medium transition-colors ${activeCategory === 'All' ? 'text-primary' : 'hover:text-primary'}`}>All Products</button>
            <button onClick={() => setActiveCategory('Security')} className={`text-sm font-medium transition-colors ${activeCategory === 'Security' ? 'text-primary' : 'hover:text-primary'}`}>Security</button>
            <button onClick={() => setActiveCategory('Solar')} className={`text-sm font-medium transition-colors ${activeCategory === 'Solar' ? 'text-primary' : 'hover:text-primary'}`}>Solar</button>
            <button onClick={() => setActiveCategory('Accessories')} className={`text-sm font-medium transition-colors ${activeCategory === 'Accessories' ? 'text-primary' : 'hover:text-primary'}`}>Accessories</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 w-48 lg:w-64 bg-secondary/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => setIsWishlistOpen(true)}>
                    <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-destructive fill-destructive' : ''}`} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Wishlist</TooltipContent>
              </Tooltip>

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Your Cart
                    </SheetTitle>
                  </SheetHeader>
                  <Separator className="my-4" />
                  
                  <ScrollArea className="flex-1 -mx-6 px-6">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <Button variant="link" onClick={() => setIsCartOpen(false)}>Start shopping</Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">RM {item.sellingPrice.toLocaleString()}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border rounded-md">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-xs w-6 text-center">{item.quantity}</span>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">RM {(item.sellingPrice * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {cart.length > 0 && (
                    <div className="pt-6 space-y-4">
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">RM {cartTotal.toLocaleString()}</span>
                      </div>
                      <Button className="w-full h-12 text-lg font-bold" onClick={handleCheckout}>
                        Checkout
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        Sila hantar bukti pembayaran ke WhatsApp kami selepas checkout.
                      </p>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsWishlistOpen(true)}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist ({wishlist.length})</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 px-3 py-1 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">
              Premium Security & Solar Solutions
            </Badge>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Empowering Your Home with <span className="text-primary">Smart Energy</span> & Safety.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Izwan Systec Enterprise provides cutting-edge security systems and sustainable solar energy solutions tailored for your needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-bold">
                Our Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Bar Mobile */}
      <div className="md:hidden container mx-auto px-4 pb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 w-full bg-secondary/50 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'Security', icon: Shield, title: 'Security Systems', desc: 'CCTV, Smart Locks & Alarms' },
              { id: 'Solar', icon: Sun, title: 'Solar Energy', desc: 'Panels, Inverters & Storage' },
              { id: 'Accessories', icon: Settings, title: 'Accessories', desc: 'Cables, Mounts & Tools' }
            ].map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -5 }}
                onClick={() => {
                  setActiveCategory(cat.id as Category);
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`cursor-pointer p-8 rounded-2xl border transition-all ${activeCategory === cat.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-card hover:border-primary/50'}`}
              >
                <cat.icon className={`w-10 h-10 mb-4 ${activeCategory === cat.id ? 'text-primary-foreground' : 'text-primary'}`} />
                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                <p className={`text-sm ${activeCategory === cat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Our Products'}
              </h2>
              <p className="text-muted-foreground">
                {filteredProducts.length} products found in {activeCategory === 'All' ? 'all categories' : activeCategory}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Security', 'Solar', 'Accessories'].map((cat) => (
                <Button 
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-6"
                  onClick={() => setActiveCategory(cat as any)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group overflow-hidden border-none bg-secondary/20 hover:bg-secondary/40 transition-colors h-full flex flex-col relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur-sm rounded-full hover:bg-background/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'text-destructive fill-destructive' : ''}`} />
                    </Button>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground border-none">
                        {product.category}
                      </Badge>
                    </div>
                    <CardHeader className="p-6 pb-2">
                      <CardTitle className="text-lg font-bold line-clamp-1">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground line-through opacity-50">RM {product.costPrice.toLocaleString()}</p>
                        <p className="text-2xl font-bold text-primary">RM {product.sellingPrice.toLocaleString()}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button className="w-full rounded-xl font-bold" onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-muted-foreground">No products found</p>
              <Button variant="link" onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}>Clear filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* Payment Info Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to upgrade?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Make your payment securely to our corporate account and send the receipt to our team for fast processing.
          </p>
          <div className="inline-flex flex-col items-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
            <CreditCard className="w-10 h-10 mb-4" />
            <h3 className="text-2xl font-bold mb-1">{BUSINESS_INFO.bank}</h3>
            <p className="text-4xl font-mono font-bold tracking-tighter mb-2">{BUSINESS_INFO.accountNo}</p>
            <p className="text-sm opacity-80">{BUSINESS_INFO.name}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                  IS
                </div>
                <h1 className="font-bold text-lg">{BUSINESS_INFO.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for security and solar energy solutions in Malaysia.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50"><Facebook className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50"><Instagram className="w-4 h-4" /></Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveCategory('All')} className="hover:text-primary transition-colors">All Products</button></li>
                <li><button onClick={() => setActiveCategory('Security')} className="hover:text-primary transition-colors">Security Systems</button></li>
                <li><button onClick={() => setActiveCategory('Solar')} className="hover:text-primary transition-colors">Solar Solutions</button></li>
                <li><button onClick={() => setActiveCategory('Accessories')} className="hover:text-primary transition-colors">Accessories</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +60 12-345 6789</li>
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> Kuantan, Pahang, Malaysia</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Subscribe to get latest updates and offers.</p>
              <div className="flex gap-2">
                <Input placeholder="Email address" className="bg-secondary/50 border-none" />
                <Button>Join</Button>
              </div>
            </div>
          </div>
          <Separator className="my-12" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© 2024 {BUSINESS_INFO.name}. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}
