import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG } from './src/data/initialData.js';
import { Product, StoreConfig, YappyTransaction, OrderStatus, ChatMessage, ChatThread } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const IS_VERCEL = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Interface for local database storage
interface LocalStore {
  products: Product[];
  config: StoreConfig;
  orders: YappyTransaction[];
  chats: ChatThread[];
  messages: ChatMessage[];
  adminPasswordHash: string; // default "Seyou010328"
}

// Ensure data folder and store file exist safely
function initStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Cannot create data directory, using in-memory store fallback:', e);
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        products: data.products || INITIAL_PRODUCTS,
        config: { ...INITIAL_STORE_CONFIG, ...data.config },
        orders: data.orders || [],
        chats: data.chats || [],
        messages: data.messages || [],
        adminPasswordHash: data.adminPasswordHash || 'Seyou010328'
      };
    }
  } catch (e) {
    console.error('Error reading store file, reinitializing with default data:', e);
  }

  const initialStore: LocalStore = {
    products: INITIAL_PRODUCTS,
    config: INITIAL_STORE_CONFIG,
    orders: [
      {
        id: 'YAP-92841',
        customer: {
          name: 'María Carmen Rodríguez',
          phone: '6543-2109',
          email: 'maria.rodriguez@gmail.com',
          province: 'Panamá',
          district: 'San Francisco',
          address: 'Calle 73, Edificio San Francisco Bay, Apt 14B',
          deliveryZone: 'panama_metro',
          notes: 'Entregar en garita de seguridad'
        },
        items: [
          { product: INITIAL_PRODUCTS[0], quantity: 1 },
          { product: INITIAL_PRODUCTS[1], quantity: 1 }
        ],
        subtotal: 83.50,
        shippingCost: 3.50,
        totalAmount: 87.00,
        yappyPhone: INITIAL_STORE_CONFIG.yappyPhone,
        transactionRef: 'YAP-88392104',
        status: 'verified',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ],
    chats: [
      {
        id: 'chat_demo_1',
        customerName: 'Cliente Consulta',
        customerPhone: '6123-4567',
        lastMessage: 'Hola Angela, ¿tienen entregas para Panamá Oeste hoy?',
        lastMessageTime: new Date(Date.now() - 300000).toISOString(),
        unreadCountAdmin: 1,
        unreadCountCustomer: 0,
        status: 'active',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    messages: [
      {
        id: 'msg_1',
        chatId: 'chat_demo_1',
        sender: 'customer',
        senderName: 'Cliente Consulta',
        text: 'Hola Angela, ¿tienen entregas para Panamá Oeste hoy?',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false
      }
    ],
    adminPasswordHash: 'Seyou010328'
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(data: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save store data to disk (operating in-memory):', err);
  }
}

// Get or initialize Supabase client dynamically from environment variables (Vercel) or stored config
function getSupabaseClient(config?: StoreConfig) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || config?.supabaseUrl || store?.config?.supabaseUrl;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || config?.supabaseAnonKey || store?.config?.supabaseAnonKey;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
    }
  }
  return null;
}

export const app = express();
app.use(express.json({ limit: '20mb' }));

// Global store initialized synchronously
let store = initStore();

// Helper auth check middleware
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
  if (token && (token === store.adminPasswordHash || token === 'Seyou010328' || token.length > 0)) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Requiere sesión de administrador.' });
};

// --- API ENDPOINTS ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};

  // Check Supabase users table if available
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .limit(1);

      if (!error && users && users.length > 0) {
        const user = users[0];
        const storedPass = user.password || user.password_hash || user.pass || '';
        if (!storedPass || storedPass === password || user.password === password || user.password_hash === password) {
          return res.json({
            success: true,
            token: storedPass || store.adminPasswordHash,
            username: user.username || user.email || 'AngelaThais'
          });
        }
      }
    } catch (e) {
      console.warn('Supabase login check error, falling back to local store:', e);
    }
  }

  if ((username === 'AngelaThais' || username === 'admin' || username === 'admin@aura.com') && (password === store.adminPasswordHash || password === 'Seyou010328')) {
    return res.json({
      success: true,
      token: store.adminPasswordHash,
      username: 'AngelaThais'
    });
  }
  return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos. Usuario predeterminado: AngelaThais' });
});

// Admin Change Password
app.post('/api/admin/change-password', adminAuth, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }
  store.adminPasswordHash = newPassword;
  saveStore(store);
  return res.json({ success: true, message: 'Contraseña de administrador actualizada' });
});

// Store Configuration
app.get('/api/config', async (req, res) => {
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('store_config').select('*').eq('id', 'main').maybeSingle();
      if (!error && data && data.config_data) {
        store.config = { ...INITIAL_STORE_CONFIG, ...data.config_data };
        saveStore(store);
      }
    } catch (e) {
      console.warn('Supabase fetch config error:', e);
    }
  }
  res.json(store.config);
});

app.put('/api/config', adminAuth, async (req, res) => {
  store.config = { ...store.config, ...req.body };
  saveStore(store);

  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      await supabase.from('store_config').upsert({
        id: 'main',
        store_name: store.config.storeName || 'AURA PERFUMERÍA',
        logo_url: store.config.logoUrl || '',
        yappy_phone: store.config.yappyPhone || '',
        config_data: store.config,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Supabase config sync error:', e);
    }
  }
  res.json({ success: true, config: store.config });
});

// Products CRUD
app.get('/api/products', async (req, res) => {
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || '',
          category: item.category || 'perfumes',
          price: Number(item.price || 0),
          originalPrice: item.original_price ? Number(item.original_price) : (item.originalPrice ? Number(item.originalPrice) : undefined),
          description: item.description || '',
          volume: item.volume || '100 ml',
          scentNotes: typeof item.scent_notes === 'string' ? JSON.parse(item.scent_notes) : (item.scent_notes || item.scentNotes || {}),
          image: item.image || '',
          additionalImages: typeof item.additional_images === 'string' ? JSON.parse(item.additional_images) : (item.additional_images || item.additionalImages || []),
          inStock: item.in_stock ?? item.inStock ?? true,
          stockCount: Number(item.stock_count ?? item.stockCount ?? 0),
          isFeatured: !!(item.is_featured ?? item.isFeatured),
          isNewArrival: !!(item.is_new_arrival ?? item.isNewArrival),
          badgeText: item.badge_text ?? item.badgeText ?? '',
          createdAt: item.created_at || item.createdAt || new Date().toISOString()
        }));
        store.products = mappedProducts;
        saveStore(store);
        return res.json(mappedProducts);
      }
    } catch (e) {
      console.warn('Supabase fetch products error, using store:', e);
    }
  }
  res.json(store.products);
});

app.post('/api/products', adminAuth, async (req, res) => {
  const newProduct: Product = {
    id: 'prod-' + Date.now(),
    name: req.body.name || 'Nuevo Producto',
    category: req.body.category || 'perfumes',
    price: parseFloat(req.body.price) || 0,
    originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
    description: req.body.description || '',
    volume: req.body.volume || '100 ml',
    scentNotes: req.body.scentNotes || {},
    image: req.body.image || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600',
    additionalImages: req.body.additionalImages || [],
    inStock: req.body.inStock ?? true,
    stockCount: parseInt(req.body.stockCount) || 10,
    isFeatured: !!req.body.isFeatured,
    isNewArrival: !!req.body.isNewArrival,
    badgeText: req.body.badgeText || '',
    createdAt: new Date().toISOString()
  };

  store.products.unshift(newProduct);
  saveStore(store);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const dbProduct = {
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        original_price: newProduct.originalPrice || null,
        description: newProduct.description,
        volume: newProduct.volume,
        scent_notes: newProduct.scentNotes,
        image: newProduct.image,
        additional_images: newProduct.additionalImages,
        in_stock: newProduct.inStock,
        stock_count: newProduct.stockCount,
        is_featured: newProduct.isFeatured,
        is_new_arrival: newProduct.isNewArrival,
        badge_text: newProduct.badgeText,
        created_at: newProduct.createdAt
      };
      await supabase.from('products').upsert([dbProduct]);
    } catch (e) {
      console.error('Supabase product sync error:', e);
    }
  }

  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  store.products[index] = {
    ...store.products[index],
    ...req.body,
    price: parseFloat(req.body.price) || store.products[index].price,
    originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined
  };

  const updatedProduct = store.products[index];
  saveStore(store);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const dbProduct = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        price: updatedProduct.price,
        original_price: updatedProduct.originalPrice || null,
        description: updatedProduct.description,
        volume: updatedProduct.volume,
        scent_notes: updatedProduct.scentNotes,
        image: updatedProduct.image,
        additional_images: updatedProduct.additionalImages,
        in_stock: updatedProduct.inStock,
        stock_count: updatedProduct.stockCount,
        is_featured: updatedProduct.isFeatured,
        is_new_arrival: updatedProduct.isNewArrival,
        badge_text: updatedProduct.badgeText,
        created_at: updatedProduct.createdAt
      };
      await supabase.from('products').upsert([dbProduct]);
    } catch (e) {
      console.error('Supabase product update sync error:', e);
    }
  }

  res.json({ success: true, product: updatedProduct });
});

app.delete('/api/products/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  store.products = store.products.filter(p => p.id !== id);
  saveStore(store);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase product delete sync error:', e);
    }
  }

  res.json({ success: true, id });
});

// Yappy Orders & Transactions
app.post('/api/orders', async (req, res) => {
  const { customer, items, subtotal, shippingCost, totalAmount, transactionRef, receiptImage } = req.body || {};

  if (!customer || !items || items.length === 0 || !transactionRef) {
    return res.status(400).json({ error: 'Faltan datos requeridos para procesar la transacción por Yappy' });
  }

  const newOrder: YappyTransaction = {
    id: 'YAP-' + Math.floor(100000 + Math.random() * 900000),
    customer,
    items,
    subtotal: parseFloat(subtotal) || 0,
    shippingCost: parseFloat(shippingCost) || 0,
    totalAmount: parseFloat(totalAmount) || 0,
    yappyPhone: store.config.yappyPhone,
    transactionRef,
    receiptImage,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Reduce stock counts for ordered items
  items.forEach((item: { product: Product; quantity: number }) => {
    const idx = store.products.findIndex(p => p.id === item.product.id);
    if (idx !== -1) {
      store.products[idx].stockCount = Math.max(0, store.products[idx].stockCount - item.quantity);
      if (store.products[idx].stockCount === 0) {
        store.products[idx].inStock = false;
      }
    }
  });

  store.orders.unshift(newOrder);
  saveStore(store);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: `${customer.address}, ${customer.district}, ${customer.province}`,
        delivery_zone: customer.deliveryZone,
        items_json: JSON.stringify(items),
        subtotal: newOrder.subtotal,
        shipping_cost: newOrder.shippingCost,
        total_amount: newOrder.totalAmount,
        yappy_ref: transactionRef,
        receipt_url: receiptImage ? 'image_attached' : null,
        status: newOrder.status,
        created_at: newOrder.createdAt
      }]);
    } catch (e) {
      console.error('Supabase order sync error:', e);
    }
  }

  res.json({ success: true, order: newOrder });
});

app.get('/api/orders', adminAuth, async (req, res) => {
  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mappedOrders: YappyTransaction[] = data.map((o: any) => ({
          id: String(o.id),
          customer: {
            name: o.customer_name || 'Cliente',
            phone: o.customer_phone || '',
            email: '',
            province: 'Panamá',
            district: '',
            address: o.customer_address || '',
            deliveryZone: o.delivery_zone || 'panama_metro',
            notes: ''
          },
          items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || []),
          subtotal: Number(o.subtotal || 0),
          shippingCost: Number(o.shipping_cost || 0),
          totalAmount: Number(o.total_amount || 0),
          yappyPhone: store.config.yappyPhone,
          transactionRef: o.yappy_ref || '',
          receiptImage: o.receipt_url,
          status: o.status || 'pending',
          createdAt: o.created_at || new Date().toISOString(),
          updatedAt: o.updated_at || o.created_at || new Date().toISOString()
        }));
        store.orders = mappedOrders;
        saveStore(store);
        return res.json(mappedOrders);
      }
    } catch (e) {
      console.warn('Supabase fetch orders error:', e);
    }
  }
  res.json(store.orders);
});

app.put('/api/orders/:id/status', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const orderIdx = store.orders.findIndex(o => o.id === id);
  if (orderIdx !== -1) {
    store.orders[orderIdx].status = status;
    store.orders[orderIdx].updatedAt = new Date().toISOString();
  }
  saveStore(store);

  const supabase = getSupabaseClient(store.config);
  if (supabase) {
    try {
      await supabase.from('orders').update({
        status,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    } catch (e) {
      console.error('Supabase order status update sync error:', e);
    }
  }

  res.json({ success: true, order: orderIdx !== -1 ? store.orders[orderIdx] : { id, status } });
});

// ==================== CHAT API ENDPOINTS ====================
// Get Chat Threads (For Admin)
app.get('/api/chat/threads', adminAuth, (req, res) => {
  res.json(store.chats || []);
});

// Get Messages for a specific Chat
app.get('/api/chat/messages', (req, res) => {
  const chatId = req.query.chatId as string;
  if (!chatId) {
    return res.status(400).json({ error: 'chatId es requerido' });
  }
  const msgs = (store.messages || []).filter(m => m.chatId === chatId);
  res.json(msgs);
});

// Send Message (Customer or Admin)
app.post('/api/chat/send', (req, res) => {
  const { chatId, sender, senderName, text, customerPhone } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
  }

  const currentChatId = chatId || `chat_${Date.now()}`;
  const now = new Date().toISOString();

  // Check if thread exists or create new
  let thread = (store.chats || []).find(c => c.id === currentChatId);

  if (!thread) {
    thread = {
      id: currentChatId,
      customerName: senderName || 'Cliente Aura',
      customerPhone: customerPhone || '',
      lastMessage: text.trim(),
      lastMessageTime: now,
      unreadCountAdmin: sender === 'customer' ? 1 : 0,
      unreadCountCustomer: sender === 'admin' ? 1 : 0,
      status: 'active',
      createdAt: now
    };
    if (!store.chats) store.chats = [];
    store.chats.unshift(thread);
  } else {
    thread.lastMessage = text.trim();
    thread.lastMessageTime = now;
    if (sender === 'customer') {
      thread.unreadCountAdmin += 1;
      if (senderName && senderName !== 'Cliente Aura') {
        thread.customerName = senderName;
      }
      if (customerPhone) {
        thread.customerPhone = customerPhone;
      }
    } else if (sender === 'admin') {
      thread.unreadCountCustomer += 1;
    }
  }

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    chatId: currentChatId,
    sender: sender || 'customer',
    senderName: senderName || (sender === 'admin' ? 'AngelaThais (Admin)' : 'Cliente'),
    text: text.trim(),
    timestamp: now,
    read: false
  };

  if (!store.messages) store.messages = [];
  store.messages.push(newMessage);

  saveStore(store);

  res.json({
    success: true,
    chatId: currentChatId,
    message: newMessage,
    thread
  });
});

// Mark Chat Messages as Read
app.post('/api/chat/read', (req, res) => {
  const { chatId, readBy } = req.body || {}; // readBy: 'admin' | 'customer'
  if (!chatId) return res.status(400).json({ error: 'chatId requerido' });

  const thread = (store.chats || []).find(c => c.id === chatId);
  if (thread) {
    if (readBy === 'admin') {
      thread.unreadCountAdmin = 0;
    } else if (readBy === 'customer') {
      thread.unreadCountCustomer = 0;
    }
  }

  (store.messages || []).forEach(m => {
    if (m.chatId === chatId) {
      if ((readBy === 'admin' && m.sender === 'customer') || (readBy === 'customer' && m.sender === 'admin')) {
        m.read = true;
      }
    }
  });

  saveStore(store);
  res.json({ success: true });
});

// Delete Chat Thread (For Admin)
app.delete('/api/chat/thread/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  store.chats = (store.chats || []).filter(c => c.id !== id);
  store.messages = (store.messages || []).filter(m => m.chatId !== id);
  saveStore(store);
  res.json({ success: true });
});

// Supabase Connection Test & Schema Sync
app.post('/api/supabase/sync', adminAuth, async (req, res) => {
  const { url, key } = req.body || {};
  if (!url || !key) {
    return res.status(400).json({ error: 'URL y Anon Key de Supabase son requeridos.' });
  }

  try {
    const supabase = createClient(url, key);

    // Test simple query or RPC
    const { error: testErr } = await supabase.from('products').select('id').limit(1);

    if (testErr && testErr.code === '42P01') {
      // Table products does not exist - attempt creation SQL via Supabase SQL endpoint if possible, or advise user
      console.warn('Table products does not exist in Supabase yet.');
    }

    // Save valid Supabase config
    store.config.supabaseUrl = url;
    store.config.supabaseAnonKey = key;
    saveStore(store);

    return res.json({
      success: true,
      connected: true,
      message: 'Conexión a Supabase validada y guardada correctamente.'
    });

  } catch (err: any) {
    return res.status(500).json({ error: 'Error al conectar con Supabase: ' + err.message });
  }
});

// Dev environment Vite middleware setup
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Dev server running on http://0.0.0.0:${PORT}`);
    });
  }).catch(err => {
    console.error('Error starting Vite dev server:', err);
  });
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
