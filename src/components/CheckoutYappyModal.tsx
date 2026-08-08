import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Copy, Check, Upload, ArrowLeft, Send, CheckCircle2, FileText, MapPin, User, Phone, Sparkles } from 'lucide-react';
import { CartItem, CustomerInfo, DeliveryZone, StoreConfig, YappyTransaction } from '../types';

interface CheckoutYappyModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryZone: DeliveryZone;
  config: StoreConfig;
  onOrderCompleted: (order: YappyTransaction) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CheckoutYappyModal: React.FC<CheckoutYappyModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryZone,
  config,
  onOrderCompleted,
  showToast
}) => {
  const [step, setStep] = useState<'info' | 'yappy_payment' | 'completed'>('info');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    province: 'Panamá',
    district: 'Panamá Centro',
    address: '',
    deliveryZone: deliveryZone,
    notes: ''
  });

  const [transactionRef, setTransactionRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<YappyTransaction | null>(null);

  if (!isOpen) return null;

  // Price calculations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= 75 && deliveryZone !== 'provincias' ? 0 : (config.deliveryRates[deliveryZone] || 3.50);
  const totalAmount = subtotal + shippingCost;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(config.yappyPhone.replace(/-/g, ''));
    setCopiedPhone(true);
    showToast('Número de Yappy copiado al portapapeles', 'info');
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('La imagen es demasiado grande. Máximo 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        showToast('Comprobante de Yappy adjuntado', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      showToast('Por favor completa los campos requeridos (Nombre, Teléfono y Dirección)', 'error');
      return;
    }
    setStep('yappy_payment');
  };

  const handleConfirmYappyOrder = async () => {
    if (!transactionRef.trim() || transactionRef.trim().length < 4) {
      showToast('Por favor ingresa el número de transacción / referencia de Yappy', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          subtotal,
          shippingCost,
          totalAmount,
          transactionRef: transactionRef.trim(),
          receiptImage
        })
      });

      const data = await response.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        onOrderCompleted(data.order);
        setStep('completed');
        showToast('¡Pedido registrado con éxito por Yappy!', 'success');
      } else {
        showToast(data.error || 'Error al procesar el pedido', 'error');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      showToast('Ocurrió un error de conexión al registrar tu pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp formatted order text helper
  const getWhatsAppLink = (order: YappyTransaction) => {
    const text = `*NUEVO PEDIDO EN AURA PERFUMES* 🛍️
*Pedido ID:* #${order.id}
*Cliente:* ${order.customer.name}
*Teléfono:* ${order.customer.phone}
*Dirección:* ${order.customer.address}, ${order.customer.province}
------------------------------
*Detalle de Productos:*
${order.items.map(i => `• ${i.quantity}x ${i.product.name} (${i.product.volume}) - $${(i.product.price * i.quantity).toFixed(2)}`).join('\n')}
------------------------------
*Subtotal:* $${order.subtotal.toFixed(2)}
*Envío:* $${order.shippingCost.toFixed(2)}
*TOTAL YAPPY:* $${order.totalAmount.toFixed(2)}
*Ref. Yappy:* #${order.transactionRef}

Adjunto el comprobante de mi pago por Yappy. ¡Muchas gracias!`;

    const encoded = encodeURIComponent(text);
    return `https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encoded}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-pink-200/80 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-800"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 border-b border-pink-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-rose-950 flex items-center gap-2">
                  <span>Pago seguro por Yappy</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-sans font-bold">PTY</span>
                </h3>
                <p className="text-xs text-stone-500">Paso {step === 'info' ? '1 de 2' : step === 'yappy_payment' ? '2 de 2' : 'Confirmado'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-pink-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">

            {/* STEP 1: CUSTOMER DELIVERY DETAILS */}
            {step === 'info' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-wider pb-2 border-b border-pink-100">
                  <User className="w-4 h-4" />
                  <span>Datos de Entrega y Contacto</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ana Lucía Morales"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 6543-2109"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Provincia *
                    </label>
                    <select
                      value={customer.province}
                      onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-500 cursor-pointer"
                    >
                      <option value="Panamá" className="bg-white text-stone-800">Panamá</option>
                      <option value="Panamá Oeste" className="bg-white text-stone-800">Panamá Oeste</option>
                      <option value="Colón" className="bg-white text-stone-800">Colón</option>
                      <option value="Chiriquí" className="bg-white text-stone-800">Chiriquí</option>
                      <option value="Coclé" className="bg-white text-stone-800">Coclé</option>
                      <option value="Veraguas" className="bg-white text-stone-800">Veraguas</option>
                      <option value="Herrera" className="bg-white text-stone-800">Herrera</option>
                      <option value="Los Santos" className="bg-white text-stone-800">Los Santos</option>
                      <option value="Bocas del Toro" className="bg-white text-stone-800">Bocas del Toro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Distrito / Corregimiento
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. San Francisco, Bella Vista, La Chorrera"
                      value={customer.district}
                      onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                      className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Dirección Exacta de Entrega *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Calle, número de casa, edificio, apartamento, punto de referencia..."
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Order Summary Mini Box */}
                <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Productos ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Costo de Envío:</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-950 text-sm pt-2 border-t border-pink-200">
                    <span>Total a Transferir por Yappy:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>Continuar con Instrucciones de Yappy</span>
                </button>
              </form>
            )}

            {/* STEP 2: YAPPY INSTRUCTIONS & CONFIRMATION CODE */}
            {step === 'yappy_payment' && (
              <div className="space-y-5">
                <button
                  onClick={() => setStep('info')}
                  className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Editar datos de entrega
                </button>

                {/* Yappy Account Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-pink-50 to-rose-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Instrucciones para transferir en Yappy</span>
                    </div>
                    <span className="text-xs font-bold text-pink-800 bg-pink-100 px-2 py-0.5 rounded border border-pink-200">
                      Monto: ${totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    1. Abre tu aplicación de Banco General o Yappy.<br />
                    2. Busca por número de celular o directorio: <strong>{config.yappyName}</strong><br />
                    3. Envía el monto exacto de <strong>${totalAmount.toFixed(2)}</strong>.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-medium">Número de Yappy</span>
                      <span className="text-base font-bold text-blue-700 tracking-widest">{config.yappyPhone}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Form to Input Yappy Reference & Screenshot */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-rose-950 block mb-1">
                      # de Transacción o Confirmación Yappy *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. YAP-9821304 o # de Referencia de 8 dígitos"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full bg-pink-50/40 border border-pink-300 rounded-xl px-3.5 py-3 text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-stone-400"
                    />
                    <span className="text-[10px] text-stone-500 block mt-1">
                      Encontrarás este número en el comprobante generado por Yappy al realizar el pago.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Adjuntar captura del comprobante Yappy (Opcional)
                    </label>
                    <div className="relative border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl p-4 text-center cursor-pointer bg-pink-50/30 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {receiptImage ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={receiptImage} alt="Comprobante" className="w-12 h-12 object-cover rounded-lg border border-pink-300" />
                          <span className="text-xs text-pink-700 font-medium">✓ Imagen de comprobante lista</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-stone-500">
                          <Upload className="w-6 h-6 mx-auto text-pink-500" />
                          <span className="text-xs font-medium block text-stone-700">Toca para seleccionar o subir foto del pago</span>
                          <span className="text-[10px] text-stone-400">PNG, JPG o screenshot (máx 8MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    onClick={handleConfirmYappyOrder}
                    className="w-full py-3.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span>Registrando Pedido...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Pago y Registrar Pedido</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: COMPLETED ORDER RECEIPT & WHATSAPP ACTION */}
            {step === 'completed' && completedOrder && (
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-2xl text-rose-950">¡Pedido Registrado con Éxito!</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Número de Orden: <strong className="text-pink-700 font-mono">#{completedOrder.id}</strong>
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-pink-200 pb-2 font-semibold text-stone-700">
                    <span>Referencia Yappy:</span>
                    <span className="text-pink-800 font-mono">#{completedOrder.transactionRef}</span>
                  </div>

                  <div className="space-y-1 py-1">
                    <span className="text-[11px] text-stone-500 font-semibold block">Productos Solicitados:</span>
                    {completedOrder.items.map((i) => (
                      <div key={i.product.id} className="flex justify-between text-stone-700 text-[11px]">
                        <span>{i.quantity}x {i.product.name} ({i.product.volume})</span>
                        <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-pink-200 pt-2 flex justify-between font-bold text-rose-950">
                    <span>Monto Total Yappy:</span>
                    <span className="text-pink-700">${completedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <div className="space-y-2 pt-2">
                  <a
                    href={getWhatsAppLink(completedOrder)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Comprobante por WhatsApp</span>
                  </a>
                  <p className="text-[10px] text-stone-500">
                    Se abrirá WhatsApp con el resumen de tu pedido listo para ser verificado por nuestro equipo.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="text-xs text-stone-500 hover:text-stone-900 underline pt-2"
                >
                  Seguir explorando el catálogo
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
