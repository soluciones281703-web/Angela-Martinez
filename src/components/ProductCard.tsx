import React from 'react';
import { ShoppingBag, Eye, Sparkles, Check, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails
}) => {
  const categoryLabels: Record<string, string> = {
    perfumes: 'Perfume',
    splash: 'Body Splash',
    cremas: 'Crema Corporal',
    lociones: 'Loción'
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="group relative bg-white border border-pink-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-pink-100 hover:border-pink-300 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-pink-50/50">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badgeText && (
            <span className="px-2.5 py-1 rounded-full bg-pink-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
              {product.badgeText}
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-pink-800 border border-pink-200 text-[10px] font-medium shadow-xs">
            {categoryLabels[product.category] || product.category}
          </span>
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-pink-950/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <button
            onClick={() => onViewDetails(product)}
            className="p-3 rounded-full bg-white text-stone-900 hover:bg-pink-500 hover:text-white transition-all shadow-lg font-medium text-xs flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalle</span>
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Volume tag & stock status */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1.5">
            <span className="text-pink-700 font-semibold">{product.volume}</span>
            {product.inStock ? (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ({product.stockCount})
              </span>
            ) : (
              <span className="text-rose-600 font-semibold">Agotado</span>
            )}
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-serif font-bold text-rose-950 text-base line-clamp-2 hover:text-pink-600 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Scent notes snippet */}
          {product.scentNotes && (
            <p className="text-xs text-stone-500 line-clamp-1 italic mt-1 font-light">
              ✨ {product.scentNotes.top || product.scentNotes.heart || 'Fragancia exclusiva'}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 border-t border-pink-100 flex items-center justify-between gap-2">
          
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-rose-950 font-bold text-lg">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-stone-400 line-through text-xs">
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">
              Paga por Yappy
            </span>
          </div>

          {/* Add to Cart Action */}
          <button
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              product.inStock
                ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200 active:scale-95'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'Añadir' : 'Agotado'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
