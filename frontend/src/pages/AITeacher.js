import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Send, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_PROMPTS = [
  'Explain the Indian Constitution preamble for UPSC',
  'Key topics for APSC CCE Prelims 2025',
  'ADRE Grade III syllabus overview',
  'Important current affairs for government exams',
  'Tips to crack SSC CGL in first attempt',
];

export default function AITeacher() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('general');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/ai/chat/history`, { withCredentials: true });
      const history = response.data.slice(0, 10).reverse().map(chat => ([
        { role: 'user', text: chat.message },
        { role: 'ai', text: chat.response }
      ])).flat();
      setMessages(history);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/chat`, {
        message: text,
        context: context
      }, { withCredentials: true });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#050505' }}>
      {/* Header */}
      <header className="glass-card border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <Brain className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h1 className="font-playfair text-xl font-bold">AI Teacher</h1>
              <p className="text-xs text-[#A1A1AA] font-outfit">Your personal exam preparation guide</p>
            </div>
          </div>
          <select
            data-testid="context-select"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm font-outfit focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="general">General</option>
            <option value="UPSC">UPSC</option>
            <option value="APSC">APSC</option>
            <option value="ADRE">ADRE</option>
            <option value="SSC">SSC</option>
            <option value="Banking">Banking</option>
          </select>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
              <h2 className="font-playfair text-2xl font-bold mb-3">Ask Your AI Teacher</h2>
              <p className="text-[#A1A1AA] font-outfit mb-8 max-w-md mx-auto">
                I'm your personal exam preparation guide. Ask me anything about UPSC, APSC, ADRE, SSC, Banking or any government exam.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    data-testid={`quick-prompt-${idx}`}
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-2 text-sm rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.05)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.15)] transition-colors font-outfit"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.2)]'
                  : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] text-xs font-semibold font-outfit">AI Teacher</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed font-outfit whitespace-pre-wrap">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-xs font-semibold font-outfit">AI Teacher</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-card border-t border-[rgba(255,255,255,0.1)] flex-shrink-0 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            data-testid="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your doubt... (e.g., Explain Article 356 for UPSC)"
            disabled={loading}
            className="flex-1 bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-xl px-5 py-3 focus:outline-none focus:border-[#D4AF37] font-outfit text-sm placeholder:text-[#A1A1AA]"
          />
          <Button
            data-testid="send-message-btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#D4AF37] hover:bg-[#B87333] text-black rounded-xl px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
