import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Truck, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { StoreConfig, ProductCategory } from '../types';

interface HeroBannerProps {
  config: StoreConfig;
  onSelectCategory: (cat: ProductCategory) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ config, onSelectCategory }) => {
  const showYappy = config.showYappyContainer !== false;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-100/70 via-rose-50 to-pink-100/70 text-stone-800 py-12 md:py-20 border-b border-pink-200/80">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-15">
        <img
          src={config.heroImageUrl}
          alt="Hero Banner Perfumes"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-50/90 via-rose-50/80 to-pink-50/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Headline & Message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${showYappy ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 text-center ${showYappy ? 'lg:text-left' : 'text-center'}`}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 border border-pink-300/80 text-pink-800 text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Colección Exclusiva 2026</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-rose-950 leading-tight">
              {config.heroTitle || 'Perfumes, Body Splash & Cremas de Lujo'}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              {config.heroSubtitle || 'Descubre fragancias irresistibles y cuidado corporal supremo. Haz tu pedido directamente desde nuestro catálogo y realiza tu pago fácil y seguro por Yappy con envío a todo Panamá.'}
            </p>

            {/* Category Quick Shortcut Buttons */}
            <div className={`pt-2 flex flex-wrap ${showYappy ? 'justify-center lg:justify-start' : 'justify-center'} gap-3`}>
              {(config.categoryOptions && config.categoryOptions.length > 0 ? config.categoryOptions : [
                { id: 'perfumes', label: 'Perfumes' },
                { id: 'splash', label: 'Body Splash' },
                { id: 'cremas', label: 'Cremas' }
              ]).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id as ProductCategory)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                    idx === 0
                      ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-200'
                      : 'bg-white border border-pink-200 text-pink-900 hover:bg-pink-50 shadow-xs'
                  }`}
                >
                  <span>{cat.label}</span>
                  {idx === 0 && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Highlights Card (Experiencia de Compra Yappy) - Optional Toggle */}
          {showYappy && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-pink-200/80 shadow-xl shadow-pink-100/50 space-y-4"
            >
              <div className="text-xs font-bold text-pink-700 tracking-wider uppercase flex items-center gap-2 pb-2 border-b border-pink-100">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>{config.yappyContainerTitle || 'Experiencia de Compra Yappy'}</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                    📱
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-950">{config.yappyContainerBox1Title || 'Pagos Seguros por Yappy'}</h4>
                    <p className="text-stone-500 text-[11px]">
                      {config.yappyContainerBox1Text || `Transfiere al ${config.yappyPhone || 'nuestro número de Yappy'} e ingresa el número de referencia.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0 text-pink-600 font-bold">
                    🚚
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-950">{config.yappyContainerBox2Title || 'Envíos a Todo Panamá'}</h4>
                    <p className="text-stone-500 text-[11px]">
                      {config.yappyContainerBox2Text || 'Mensajería en Ciudad de Panamá, Panamá Oeste e Interior por Uno Express o Flete.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-950">{config.yappyContainerBox3Title || 'Garantía de Calidad'}</h4>
                    <p className="text-stone-500 text-[11px]">
                      {config.yappyContainerBox3Text || 'Fragancias originales con excelente fijación y duración garantizada.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
