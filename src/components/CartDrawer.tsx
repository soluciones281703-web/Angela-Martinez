import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, Smartphone, Truck, ChevronRight, Sparkles } from 'lucide-react';
import { CartItem, DeliveryZone, StoreConfig } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  deliveryZone: DeliveryZone;
  onSelectDeliveryZone: (zone: DeliveryZone) => void;
  config: StoreConfig;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryZone,
  onSelectDeliveryZone,
  config,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 75;
  const isFreeShipping = subtotal >= freeShippingThreshold && deliveryZone !== 'provincias';
  
  const shippingCost = isFreeShipping
    ? 0
    : config.deliveryRates[deliveryZone] || 3.50;

  const total = subtotal + shippingCost;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-sm">
        
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 w-full max-w-md bg-white border-l border-pink-200/80 text-stone-800 h-full flex flex-col justify-between shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              <h2 className="font-serif font-bold text-lg text-rose-950">Tu Carrito de Compras</h2>
              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs font-bold shadow-xs">
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-pink-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-pink-100">
            
            {/* Free shipping progress bar */}
            {subtotal > 0 && (
              <div className="p-3 rounded-xl bg-pink-50/80 border border-pink-200 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between font-medium">
                  <span className="text-stone-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-pink-600" /> Envíos en Panamá
                  </span>
                  <span className="text-pink-700 font-bold">
                    {subtotal >= freeShippingThreshold ? '¡Envío Gratis Aplicado!' : `Faltan $${(freeShippingThreshold - subtotal).toFixed(2)} para Envío Gratis`}
                  </span>
                </div>
                <div className="w-full bg-pink-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-pink-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <p className="font-semibold text-rose-950">Tu carrito está vacío</p>
                  <p className="text-xs text-stone-500 mt-1">Explora nuestros perfumes, splash y cremas para añadir tus favoritos.</p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="pt-4 flex gap-3 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-pink-50 border border-pink-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-rose-950 truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-pink-700 font-medium">{item.product.volume}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-pink-200 rounded-lg bg-pink-50/50 text-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-pink-100 bg-pink-50/40 space-y-4">
              
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Zona de Entrega en Panamá:
                </label>
                <select
                  value={deliveryZone}
                  onChange={(e) => onSelectDeliveryZone(e.target.value as DeliveryZone)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-pink-500 cursor-pointer shadow-xs"
                >
                  {(config.deliveryZones && config.deliveryZones.length > 0
                    ? config.deliveryZones
                    : [
                        { id: 'panama_metro', name: 'Ciudad de Panamá (Metro)', price: config.deliveryRates.panama_metro ?? 3.50 },
                        { id: 'panama_oeste', name: 'Panamá Oeste (Arraiján / Chorrera)', price: config.deliveryRates.panama_oeste ?? 4.50 },
                        { id: 'provincias', name: 'Provincias / Interior (Uno Express/Flete)', price: config.deliveryRates.provincias ?? 6.00 },
                        { id: 'retiro', name: 'Retiro en Tienda / Punto Medio', price: config.deliveryRates.retiro ?? 0.00 }
                      ]
                  ).map((zone) => (
                    <option key={zone.id} value={zone.id} className="bg-white text-stone-800">
                      {zone.name} - {zone.price === 0 ? 'GRATIS' : `$${zone.price.toFixed(2)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-pink-200/60">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span className="font-semibold text-rose-950">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de Envío:</span>
                  <span className="font-semibold text-rose-950">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-bold">GRATIS</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-rose-950 pt-2 border-t border-pink-200">
                  <span>Total a Pagar por Yappy:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-white" />
                <span>Pagar con Yappy (${total.toFixed(2)})</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClearCart}
                className="w-full text-center text-[11px] text-stone-400 hover:text-stone-700 underline"
              >
                Vaciar carrito
              </button>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
