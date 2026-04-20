import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, Loader2, MessageCircle, Send, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: Date;
}

type ModelId = 'gemini' | 'copilot' | 'gpt';

interface ModelConfig {
  id: ModelId;
  label: string;
  shortLabel: string;
  color: string;
  available: boolean;
}

// ── Model registry ────────────────────────────────────────────────────────
const MODELS: ModelConfig[] = [
  { id: 'gemini', label: 'Gemini 2.0 Flash', shortLabel: 'Gemini', color: 'text-blue-400', available: true },
  { id: 'copilot', label: 'Copilot (GPT-4o)', shortLabel: 'Copilot', color: 'text-purple-400', available: false },
  { id: 'gpt', label: 'GPT-4o', shortLabel: 'GPT-4o', color: 'text-emerald-400', available: false },
];

const SYSTEM_PROMPT = `You are a helpful and friendly AI assistant for Izwan Systec Enterprise (isystec.my), a Malaysian company selling security cameras, solar panels, solar accessories, and electrical hardware.

Company info:
- Name: Izwan Systec Enterprise (SSM: 202103055724 / CA0318484-D)  
- Products: CCTV cameras, sirens, motion sensors, solar panels, charge controllers, batteries, cables, switches, brackets, enclosures
- Payment: DuitNow/bank transfer to CIMB 8604630283, or WhatsApp order
- Contact: izwansystec@gmail.com | WhatsApp: +601741455

Your role:
- Answer product questions in Bahasa Malaysia or English (match the user's language)
- Help customers choose the right product for their needs
- Explain pricing, payment methods, and the ordering process
- Be warm, helpful and professional
- If asked about something outside Izwan Systec's scope, politely redirect
- Keep responses concise (2-4 sentences max unless more detail is needed)`;

// ── API caller ────────────────────────────────────────────────────────────
async function callGemini(messages: Message[], apiKey: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const history = messages
    .filter((m) => m.role !== 'system')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    config: { systemInstruction: SYSTEM_PROMPT },
    history: history.slice(0, -1),
  });

  const lastMsg = messages.filter((m) => m.role === 'user').at(-1)?.content ?? '';
  const response = await chat.sendMessage({ message: lastMsg });
  return response.text ?? 'Maaf, saya tidak dapat memberikan respons buat masa ini.';
}

// Select best available model, rotating if needed
function selectModel(preferred: ModelId, _attempt = 0): ModelId {
  const rotation: ModelId[] = ['gemini', 'copilot', 'gpt'];
  const available = rotation.filter((m) => MODELS.find((c) => c.id === m)?.available);
  if (available.includes(preferred)) return preferred;
  return available[0] ?? 'gemini';
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Assalamualaikum! 👋 Saya pembantu AI Izwan Systec. Boleh saya bantu anda pilih kamera, panel solar atau aksesori yang sesuai hari ini?',
      model: 'gemini',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelId>('gemini');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? (window as any).GEMINI_API_KEY ?? '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const chosenModel = selectModel(activeModel);

    try {
      let reply: string;

      if (chosenModel === 'gemini' && apiKey) {
        reply = await callGemini([...messages, userMsg], apiKey);
      } else if (!apiKey) {
        // Demo mode when no API key
        reply = `[Demo mode — tiada API key] Anda bertanya: "${text}". Sila isi VITE_GEMINI_API_KEY dalam fail .env untuk mendayakan chatbot AI sepenuhnya.`;
      } else {
        reply = `Model ${chosenModel} belum dikonfigurasi. Sila hubungi admin.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          model: chosenModel,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, berlaku ralat. Sila cuba sebentar lagi. 🙏',
          model: chosenModel,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentModel = MODELS.find((m) => m.id === activeModel) ?? MODELS[0];

  return (
    <>
      {/* ── Floating chat bubble ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40 transition-all hover:scale-110 active:scale-95"
        aria-label="Buka chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-black text-white">
            AI
          </span>
        )}
      </button>

      {/* ── Chat window ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1830] shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-primary/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/20 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Pembantu AI Izwan Systec</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            {/* Model picker */}
            <div className="relative">
              <button
                onClick={() => setShowModelPicker((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold transition hover:bg-white/10"
              >
                <Zap className={`h-3 w-3 ${currentModel.color}`} />
                <span className={currentModel.color}>{currentModel.shortLabel}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
              {showModelPicker && (
                <div className="absolute right-0 top-8 z-10 min-w-[160px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1830] shadow-xl">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setActiveModel(m.id); setShowModelPicker(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition hover:bg-white/5 ${
                        activeModel === m.id ? 'bg-white/5' : ''
                      } ${!m.available ? 'opacity-40' : ''}`}
                    >
                      <Zap className={`h-3 w-3 ${m.color}`} />
                      <span className="font-medium">{m.label}</span>
                      {!m.available && <span className="ml-auto text-[9px] text-muted-foreground">Perlu key</span>}
                      {m.id === activeModel && <span className="ml-auto text-[9px] text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="mr-2 mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-primary/20">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-white/10 text-foreground'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && msg.model && (
                    <p className={`mt-1 text-[10px] opacity-50 ${MODELS.find(m => m.id === msg.model)?.color ?? ''}`}>
                      {MODELS.find(m => m.id === msg.model)?.shortLabel ?? msg.model}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-primary/20">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Sedang menaip...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Tanya soalan anda..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Dikuasakan oleh AI · Izwan Systec Enterprise
            </p>
          </div>
        </div>
      )}
    </>
  );
}
