import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutYappyModal } from './components/CheckoutYappyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerChatWidget } from './components/CustomerChatWidget';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Product, StoreConfig, CartItem, DeliveryZone, ProductCategory, YappyTransaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG } from './data/initialData';
import { Sparkles, Smartphone, Truck, ShieldCheck, Heart, MapPin, PhoneCall, ArrowUp } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [config, setConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);

  // Filters & Searching
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('panama_metro');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Load products & store config from server API
  const loadDataFromServer = async () => {
    try {
      const [prodRes, confRes] = await Promise.all([
        fetch(`/api/products?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/config?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } })
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }
      }

      if (confRes.ok) {
        const confData = await confRes.json();
        if (confData && typeof confData === 'object') {
          setConfig(confData);
        }
      }
    } catch (e) {
      console.log('Using default initial data fallback');
    }
  };

  useEffect(() => {
    loadDataFromServer();
    const interval = setInterval(() => {
      loadDataFromServer();
    }, 3000); // Sincronización en tiempo real cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });

    addToast(`"${product.name}" añadido al carrito`, 'success');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Producto removido del carrito', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBuyWithYappy = (product: Product, quantity = 1) => {
    setCart([{ product, quantity }]);
    setIsCheckoutModalOpen(true);
  };

  // Filter & Sort logic
  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (onlyInStock && !p.inStock) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchVolume = p.volume.toLowerCase().includes(query);
        return matchName || matchDesc || matchCat || matchVolume;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      // 'featured'
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/60 via-rose-50/30 to-pink-50/60 text-stone-800 font-sans selection:bg-pink-200 selection:text-pink-900 flex flex-col justify-between">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Navbar */}
      <Navbar
        config={config}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Store Banner */}
      <HeroBanner
        config={config}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Sticky Category & Sort Filters Bar */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onlyInStock={onlyInStock}
        onToggleInStock={() => setOnlyInStock(!onlyInStock)}
        totalProducts={filteredProducts.length}
        categoryOptions={config.categoryOptions}
      />

      {/* Main Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Active Filter Title */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-pink-200/80">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-rose-950 flex items-center gap-2">
              <span>
                {selectedCategory === 'all' ? 'Catálogo Completo' : (
                  config.categoryOptions?.find(c => c.id === selectedCategory)?.label ||
                  (selectedCategory === 'perfumes' ? 'Perfumes de Lujo' :
                   selectedCategory === 'splash' ? 'Body Splash & Mists' :
                   selectedCategory === 'cremas' ? 'Cremas Corporales' :
                   selectedCategory === 'lociones' ? 'Lociones Perfumadas' : selectedCategory)
                )}
              </span>
              <Sparkles className="w-5 h-5 text-pink-500" />
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-light mt-1">
              Explora nuestra selección exclusiva con entregas rápidas en todo Panamá y pago directo por Yappy.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-pink-100/80 border border-pink-200 flex items-center justify-center text-pink-500 mx-auto">
              <Sparkles className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="font-serif font-bold text-lg text-rose-950">No se encontraron productos</h3>
            <p className="text-xs text-stone-500">Intenta cambiando el filtro de categoría o tu búsqueda.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setOnlyInStock(false);
              }}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-all shadow-md shadow-pink-200"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewDetails={(p) => setSelectedProductDetail(p)}
              />
            ))}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-pink-100/60 to-rose-100/80 border-t border-pink-200/80 text-stone-700 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-serif font-bold flex items-center justify-center shadow-sm">
                A
              </div>
              <span className="font-serif font-bold text-lg text-rose-950">
                {config.storeName}
              </span>
            </div>
            <p className="text-stone-600 font-light leading-relaxed">
              Catálogo exclusivo de fragancias, mists corporales, cremas nutritivas y lociones perfumadas de la más alta fijación en Panamá.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-pink-700 uppercase tracking-wider text-[11px]">Pagos & Yappy</h4>
            <div className="p-3 rounded-xl bg-white/80 border border-pink-200/80 space-y-1.5 shadow-sm">
              <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>Yappy Directo: {config.yappyPhone}</span>
              </span>
              <p className="text-stone-500 text-[10px]">Paga fácil transfiriendo desde tu app de Banco General o Yappy.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-pink-700 uppercase tracking-wider text-[11px]">Cobertura de Envíos</h4>
            <ul className="space-y-1 text-stone-600">
              <li>• Ciudad de Panamá ($3.50)</li>
              <li>• Panamá Oeste ($4.50)</li>
              <li>• Provincias e Interior ($6.00)</li>
              <li>• Envío GRATIS en compras mayores a $75</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-pink-700 uppercase tracking-wider text-[11px]">Atención al Cliente</h4>
            <p className="text-stone-600">¿Tienes preguntas sobre alguna fragancia o pedido?</p>
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-pink-200/80 text-center text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {config.storeName}. Todos los derechos reservados. Panamá, R.P.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-pink-600 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyWithYappy={(p, qty) => handleBuyWithYappy(p, qty)}
      />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        deliveryZone={deliveryZone}
        onSelectDeliveryZone={setDeliveryZone}
        config={config}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutModalOpen(true);
        }}
      />

      {/* CHECKOUT YAPPY MODAL */}
      <CheckoutYappyModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={cart}
        deliveryZone={deliveryZone}
        config={config}
        onOrderCompleted={() => {
          setCart([]);
        }}
        showToast={addToast}
      />

      {/* ADMIN DASHBOARD */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        config={config}
        onRefreshData={loadDataFromServer}
        showToast={addToast}
      />

      {/* CUSTOMER SUPPORT LIVE CHAT WIDGET */}
      <CustomerChatWidget config={config} />

    </div>
  );
}

