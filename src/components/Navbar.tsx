import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Sparkles, Menu, X, PhoneCall, Smartphone } from 'lucide-react';
import { ProductCategory, StoreConfig } from '../types';

interface NavbarProps {
  config: StoreConfig;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  isAdminLoggedIn,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const defaultCategories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'perfumes', label: 'Perfumes' },
    { id: 'splash', label: 'Body Splash' },
    { id: 'cremas', label: 'Cremas' },
    { id: 'lociones', label: 'Lociones' }
  ];

  const categories = [
    { id: 'all' as ProductCategory | 'all', label: 'Todos' },
    ...(config.categoryOptions && config.categoryOptions.length > 0
      ? config.categoryOptions.map(c => ({ id: c.id as ProductCategory | 'all', label: c.label }))
      : defaultCategories.slice(1))
  ];

  const storeTitle = config.storeTitle || config.storeName || 'AURA';
  const storeSubtitle = config.storeSubtitle || 'Fragrances & Beauty';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-200/80 text-stone-800 shadow-sm">
      {/* Top Bar Announcement */}
      {config.bannerMessage && (
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 text-rose-950 text-xs py-2 px-4 text-center border-b border-pink-200/80 font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse shrink-0" />
          <span>{config.bannerMessage}</span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded text-[10px] text-pink-800 border border-pink-300/80 shadow-xs">
            <Smartphone className="w-3 h-3 text-blue-600" /> Pagos por Yappy
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { onSelectCategory('all'); onSearchChange(''); }}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={storeTitle}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover bg-pink-100 border border-pink-300 shadow-md shadow-pink-200 group-hover:scale-105 transition-transform shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md shadow-pink-200 group-hover:scale-105 transition-transform shrink-0">
                  {storeTitle.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div>
                <span className="font-serif tracking-widest text-xl font-bold text-rose-950 uppercase block leading-tight">
                  {storeTitle}
                </span>
                {storeSubtitle && (
                  <span className="block text-[10px] tracking-widest text-pink-700 uppercase font-sans font-semibold">
                    {storeSubtitle}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <input
                type="text"
                placeholder="Buscar perfumes, splash, cremas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-full pl-10 pr-4 py-2 text-sm text-stone-800 placeholder-pink-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-pink-50 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Yappy Direct Info Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Yappy: <strong>{config.yappyPhone}</strong></span>
            </div>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isAdminLoggedIn
                  ? 'bg-pink-100 text-pink-800 border-pink-300'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-pink-50 hover:text-pink-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdminLoggedIn ? 'text-pink-600' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">
                {isAdminLoggedIn ? 'Panel Admin' : 'Admin'}
              </span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-md shadow-pink-200 flex items-center gap-2 font-bold text-xs active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="hidden xs:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-pink-600 text-xs font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {showSearchMobile && (
          <div className="md:hidden pb-4 px-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              <input
                type="text"
                placeholder="Buscar perfumes, splash, cremas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-pink-50/80 border border-pink-200 rounded-full pl-10 pr-4 py-2 text-sm text-stone-800 placeholder-pink-300"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Desktop Category Nav */}
        <nav className="hidden sm:flex items-center justify-center gap-1 sm:gap-2 pb-3 overflow-x-auto no-scrollbar border-t border-pink-100 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-pink-500 text-white font-bold shadow-sm shadow-pink-200'
                  : 'text-stone-600 hover:text-rose-950 hover:bg-pink-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-pink-200 bg-white px-4 py-3 space-y-2">
          <div className="text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">Categorías</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-pink-50 text-stone-700 border border-pink-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs text-stone-600">
            <span>Yappy para pagos: <strong>{config.yappyPhone}</strong></span>
            <a
              href={`https://wa.me/${config.whatsappNumber.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-pink-600 flex items-center gap-1 underline font-medium"
            >
              <PhoneCall className="w-3 h-3" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
