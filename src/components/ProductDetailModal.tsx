import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Sparkles, ShieldCheck, Heart, Smartphone, CheckCircle, PackageCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyWithYappy: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyWithYappy
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  if (!product) return null;

  const currentImage = activeImage || product.image;
  const allImages = [product.image, ...(product.additionalImages || [])];

  const categoryLabels: Record<string, string> = {
    perfumes: 'Perfume de Alta Concentración',
    splash: 'Body Splash & Mist Corporal',
    cremas: 'Crema Corporal Hidratante',
    lociones: 'Loción Perfumada'
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white border border-pink-200/80 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-stone-600 hover:text-stone-900 hover:bg-pink-100 transition-colors border border-pink-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            
            {/* Left Image Section */}
            <div className="md:col-span-6 bg-pink-50/50 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-pink-200/80">
              
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-pink-200 shadow-md bg-white">
                <img
                  src={currentImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />

                {product.badgeText && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm">
                    {product.badgeText}
                  </span>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === img ? 'border-pink-500 scale-105 shadow-sm' : 'border-pink-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Security & Authenticity guarantees */}
              <div className="mt-6 w-full grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-pink-200/80 shadow-xs">
                  <PackageCheck className="w-4 h-4 text-pink-600 shrink-0" />
                  <span>Producto 100% Original</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-pink-200/80 shadow-xs">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Pago Inmediato Yappy</span>
                </div>
              </div>

            </div>

            {/* Right Information Section */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div>
                <span className="text-pink-700 text-xs font-semibold uppercase tracking-widest block mb-1">
                  {categoryLabels[product.category] || product.category}
                </span>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-rose-950 leading-snug">
                  {product.name}
                </h2>

                {/* Price & Volume */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-rose-950">
                    ${product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-stone-400 line-through text-sm">
                      ${product.originalPrice?.toFixed(2)}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-pink-100 text-pink-800 text-xs font-semibold border border-pink-200">
                    {product.volume}
                  </span>
                </div>

                {/* Stock status */}
                <div className="mt-2 text-xs">
                  {product.inStock ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> En inventario disponible para entrega inmediata
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">Agotado temporalmente</span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                  {product.description}
                </p>

                {/* Olfactory Pyramid (Scent Notes) */}
                {product.scentNotes && (
                  <div className="mt-5 p-4 rounded-xl bg-pink-50/70 border border-pink-200/80 space-y-2">
                    <div className="text-xs font-bold text-pink-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>Pirámide Olfativa / Notas</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700">
                      {product.scentNotes.top && (
                        <div>
                          <strong className="text-rose-950">Notas de Salida:</strong> {product.scentNotes.top}
                        </div>
                      )}
                      {product.scentNotes.heart && (
                        <div>
                          <strong className="text-rose-950">Notas de Corazón:</strong> {product.scentNotes.heart}
                        </div>
                      )}
                      {product.scentNotes.base && (
                        <div>
                          <strong className="text-rose-950">Notas de Fondo:</strong> {product.scentNotes.base}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Picker & Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-pink-100">
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Cantidad:</span>
                  <div className="flex items-center border border-pink-200 rounded-xl bg-pink-50/50 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-pink-100 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-stone-900 font-bold text-sm min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-pink-100 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-stone-500">
                    Subtotal: <strong className="text-rose-950">${(product.price * quantity).toFixed(2)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    disabled={!product.inStock}
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-stone-100 border border-stone-300 hover:bg-pink-50 text-stone-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-pink-600" />
                    <span>Añadir al Carrito</span>
                  </button>

                  <button
                    disabled={!product.inStock}
                    onClick={() => {
                      onBuyWithYappy(product, quantity);
                      onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-white" />
                    <span>Pagar con Yappy</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
