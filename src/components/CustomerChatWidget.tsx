import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Check, CheckCheck, Phone, Sparkles } from 'lucide-react';
import { ChatMessage, StoreConfig } from '../types';

interface CustomerChatWidgetProps {
  config: StoreConfig;
}

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string>(() => {
    return localStorage.getItem('aura_chat_id') || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  });
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('aura_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('aura_customer_phone') || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('aura_chat_id', chatId);
  }, [chatId]);

  // Fetch messages and poll
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
        
        // Check if there are unread messages from admin
        const unread = data.some(m => m.sender === 'admin' && !m.read);
        if (unread && !isOpen) {
          setHasUnread(true);
        }
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // poll every 3s
    return () => clearInterval(interval);
  }, [chatId, isOpen]);

  // Mark as read when opening chat
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, readBy: 'customer' })
      });
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (customerName) localStorage.setItem('aura_customer_name', customerName);
    if (customerPhone) localStorage.setItem('aura_customer_phone', customerPhone);

    const textToSend = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sender: 'customer',
          senderName: customerName || 'Cliente Aura',
          customerPhone: customerPhone || '',
          text: textToSend
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatId(data.chatId);
        fetchMessages();
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setLoading(false);
    }
  };

  const storeTitle = config.storeTitle || config.storeName || 'AURA';

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-2xl shadow-pink-500/50 flex items-center justify-center transition-all hover:scale-105 group"
          title="Atención al Cliente en Vivo"
        >
          <MessageCircle className="w-7 h-7" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-bounce" />
          )}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
            Atención al Cliente
          </span>
        </button>
      )}

      {/* Chat Pop-up Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-pink-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={storeTitle} className="w-9 h-9 rounded-full object-cover bg-white p-0.5 border border-pink-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white text-pink-700 font-serif font-bold text-lg flex items-center justify-center shadow-xs">
                  {storeTitle.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-sm tracking-wide leading-tight">
                  Atención al Cliente
                </h3>
                <span className="text-[10px] text-pink-100 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AngelaThais (Admin) En línea
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Name/Phone Quick Info banner if not set */}
          {(!customerName || !customerPhone) && messages.length === 0 && (
            <div className="bg-pink-50 p-3 text-xs border-b border-pink-100 space-y-2">
              <p className="text-stone-700 font-medium text-[11px]">
                👋 ¡Hola! Escríbenos tu consulta y te responderemos de inmediato.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-white border border-pink-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-800"
                />
                <input
                  type="text"
                  placeholder="Tu Celular / WhatsApp"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-white border border-pink-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-800"
                />
              </div>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/50 text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-stone-500 font-medium text-xs max-w-[240px] mx-auto">
                  ¿Tienes dudas sobre algún perfume, disponibilidad o envío? Escribe aquí tu mensaje.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-stone-400 mb-0.5 px-1 font-semibold">
                      {isCustomer ? (customerName || 'Tú') : 'AngelaThais (Atención AURA)'}
                    </span>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-normal leading-relaxed shadow-xs ${
                        isCustomer
                          ? 'bg-pink-600 text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-pink-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Option */}
          <div className="bg-white px-3 py-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>¿Prefieres WhatsApp?</span>
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola Angela, me gustaría hacer una consulta sobre la tienda AURA.')}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> Chatear por WhatsApp
            </a>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-pink-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
