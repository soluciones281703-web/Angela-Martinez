import { Product, StoreConfig } from '../types';

// Default images generated or high quality perfume representations
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Élixir Noir - Eau de Parfum',
    category: 'perfumes',
    price: 65.00,
    originalPrice: 75.00,
    description: 'Una fragancia elegante y seductora con notas amaderadas, orquídea negra y vainilla bourbon. Diseñada para ocasiones especiales y noches inolvidables.',
    volume: '100 ml / 3.4 oz',
    scentNotes: {
      top: 'Bergamota italiana, Ciruela negra, Pimienta rosa',
      heart: 'Orquídea salvaje, Jazmín de noche, Iris',
      base: 'Vainilla Bourbon, Ámbar dorado, Sándalo'
    },
    image: '/src/assets/images/perfume_bottle_luxury_1786157691258.jpg',
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    isNewArrival: true,
    badgeText: 'Más Vendido',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Velvet Rose & Vanilla Body Splash',
    category: 'splash',
    price: 18.50,
    originalPrice: 22.00,
    description: 'Bruma corporal refrescante con destellos sutiles de brillo. Aroma dulce y romántico a pétalos de rosa fresca, pétalos aterciopelados y crema de vainilla.',
    volume: '250 ml / 8.4 fl oz',
    scentNotes: {
      top: 'Fresas silvestres, Rosa de mayo',
      heart: 'Crema de malvavisco, Orquídea rosa',
      base: 'Vainilla suave, Almizcle blanco'
    },
    image: '/src/assets/images/body_splash_mist_1786157705336.jpg',
    inStock: true,
    stockCount: 28,
    isFeatured: true,
    badgeText: 'Favorito',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Crema Corporal Hidratante Shea & Gold',
    category: 'cremas',
    price: 24.00,
    originalPrice: 28.00,
    description: 'Manteca corporal ulta-cremosa enriquecida con manteca de karité, aceite de jojoba y vitamina E. Deja la piel sedosa, profundamente nutrida e impregnada de un aroma cálido.',
    volume: '200 g / 7 oz',
    scentNotes: {
      top: 'Flor de almendro, Miel de azahar',
      heart: 'Karité batido, Coco de agua',
      base: 'Ámbar cálido, Tonka suave'
    },
    image: '/src/assets/images/body_cream_jar_1786157719288.jpg',
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    badgeText: 'NUEVO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Loción Perfumada Silk Hydration',
    category: 'lociones',
    price: 21.00,
    originalPrice: 25.00,
    description: 'Loción fluida de absorción rápida que hidrata durante 24 horas continuas. Deja un velo aromático irresistible a flores blancas y brisa marina.',
    volume: '300 ml / 10 fl oz',
    scentNotes: {
      top: 'Citrus mediterráneo, Neroli',
      heart: 'Pétalos de peonía, Lirio del valle',
      base: 'Madera de cedro, Almizcle limpio'
    },
    image: '/src/assets/images/body_lotion_pump_1786157735550.jpg',
    inStock: true,
    stockCount: 18,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Coconut Passion Mist Splash',
    category: 'splash',
    price: 16.00,
    description: 'Un viaje sensorial al trópico. Bruma hidratante con coco tostado, flor de tiaré y un toque de piña jugosa. Sensación fresca todo el día.',
    volume: '250 ml / 8.4 fl oz',
    scentNotes: {
      top: 'Agua de coco, Piña silvestre',
      heart: 'Flor de Tiaré, Leche de coco',
      base: 'Azúcar moreno, Vainilla suave'
    },
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600',
    inStock: true,
    stockCount: 30,
    badgeText: 'Verano',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Luxe Amber Royale - Parfum',
    category: 'perfumes',
    price: 72.00,
    originalPrice: 85.00,
    description: 'Perfume de alta concentración con aura real. Notas sofisticadas de ámbar cristalino, azafrán, flor de azahar y maderas preciosas.',
    volume: '100 ml / 3.4 oz',
    scentNotes: {
      top: 'Azafrán, Naranja amarga',
      heart: 'Jazmín Sambac, Ámbar gris',
      base: 'Cedro del Atlas, Resina de abeto'
    },
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    inStock: true,
    stockCount: 12,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Loción Corporal Lavender & Chamomile',
    category: 'lociones',
    price: 19.50,
    description: 'Loción corporal de noche infusionada con lavanda francesa y manzanilla calmante. Ideal para aplicar antes de dormir y relajar los sentidos.',
    volume: '250 ml / 8.4 fl oz',
    scentNotes: {
      top: 'Lavanda pura, Salvia',
      heart: 'Manzanilla azul, Eucalipto suave',
      base: 'Sándalo blanco, Vainilla relajante'
    },
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    inStock: true,
    stockCount: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Crema Exfoliante Glow Sugar & Berries',
    category: 'cremas',
    price: 22.00,
    description: 'Crema exfoliante corporal con cristales de azúcar natural y extracto de frutos rojos. Elimina células muertas y deja un brillo radiante.',
    volume: '250 g / 8.8 oz',
    scentNotes: {
      top: 'Frambuesa silvestre, Zarzamora',
      heart: 'Flor de saúco, Frambuesa negra',
      base: 'Azúcar glaseado, Almizcle'
    },
    image: 'https://images.unsplash.com/photo-1608248597260-652163582684?auto=format&fit=crop&q=80&w=600',
    inStock: true,
    stockCount: 14,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: 'AURA',
  storeTitle: 'AURA',
  storeSubtitle: 'Fragrances & Beauty',
  logoUrl: '',
  bannerMessage: '✨ Envíos a todo Panamá | Pagos 100% seguros con Yappy 📱 | Entregas express disponibles',
  heroTitle: 'Perfumes, Body Splash & Cremas de Lujo',
  heroSubtitle: 'Descubre fragancias irresistibles y cuidado corporal supremo. Haz tu pedido directamente desde nuestro catálogo y realiza tu pago fácil y seguro por Yappy con envío a todo Panamá.',
  heroImageUrl: '/src/assets/images/hero_perfumes_banner_1786157676428.jpg',
  showYappyContainer: true,
  yappyContainerTitle: 'Experiencia de Compra Yappy',
  yappyContainerBox1Title: 'Pagos Seguros por Yappy',
  yappyContainerBox1Text: 'Transfiere directo a nuestra cuenta de Yappy e ingresa el número de referencia.',
  yappyContainerBox2Title: 'Envíos a Todo Panamá',
  yappyContainerBox2Text: 'Mensajería en Ciudad de Panamá, Panamá Oeste e Interior por Uno Express o Flete.',
  yappyContainerBox3Title: 'Garantía de Calidad',
  yappyContainerBox3Text: 'Fragancias originales con excelente fijación y duración garantizada.',
  yappyPhone: '6200-0000',
  yappyName: 'Aura Perfumes PTY',
  whatsappNumber: '50762000000',
  currencySymbol: '$',
  deliveryZones: [
    { id: 'panama_metro', name: 'Ciudad de Panamá (Metro)', price: 3.50, description: 'Entrega en 24h a 48h' },
    { id: 'panama_oeste', name: 'Panamá Oeste (Arraiján / Chorrera)', price: 4.50, description: 'Entrega en 24h a 48h' },
    { id: 'provincias', name: 'Provincias / Interior (Uno Express/Flete)', price: 6.00, description: 'Envío por encomienda' },
    { id: 'retiro', name: 'Retiro en Tienda / Punto Medio', price: 0.00, description: 'Coordinar entrega en punto acordado' }
  ],
  deliveryRates: {
    panama_metro: 3.50,
    panama_oeste: 4.50,
    provincias: 6.00,
    retiro: 0.00
  },
  categoryOptions: [
    { id: 'perfumes', label: 'Perfumes', icon: '💎' },
    { id: 'splash', label: 'Body Splash', icon: '🌸' },
    { id: 'cremas', label: 'Cremas', icon: '🧴' },
    { id: 'lociones', label: 'Lociones', icon: '🌿' }
  ],
  supabaseUrl: '',
  supabaseAnonKey: ''
};
