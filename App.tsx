import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, RefreshCw, Info, Leaf, Droplets, FlaskConical, Map, ShieldAlert } from 'lucide-react';
import { ChatMessage, Topic } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { ChatMessageItem } from './components/ChatMessageItem';

// Predefined topics for quick context switching
const TOPICS: Topic[] = [
  { id: 'general', title: 'Tutoría General', icon: 'Bot', contextPrompt: 'Hola, soy tu tutor. ¿En qué proyecto minero o concepto químico trabajamos hoy?' },
  { id: 'mercurio', title: 'Mercurio y Amalgamas', icon: 'ShieldAlert', contextPrompt: 'Hablemos sobre el mercurio (Hg) en la minería de oro y sus riesgos.' },
  { id: 'cianuro', title: 'Cianuro y Lixiviación', icon: 'FlaskConical', contextPrompt: 'Analicemos el proceso de cianuración y su química.' },
  { id: 'agua', title: 'Calidad del Agua', icon: 'Droplets', contextPrompt: '¿Cómo afecta la minería a las fuentes hídricas de Cáceres?' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic>(TOPICS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    addSystemMessage(currentTopic.contextPrompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addSystemMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      text: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    
    // Add User Message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };
    
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    // Placeholder for AI thinking
    const thinkingMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: thinkingMessageId, role: 'model', text: '', timestamp: new Date(), isThinking: true }
    ]);

    try {
      const responseText = await sendMessageToGemini(userText, messages);
      
      // Remove thinking message and add actual response
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== thinkingMessageId);
        return [
          ...filtered,
          { id: Date.now().toString(), role: 'model', text: responseText, timestamp: new Date() }
        ];
      });
    } catch (error) {
      console.error("Error sending message", error);
      setMessages((prev) => prev.filter(m => m.id !== thinkingMessageId)); // cleanup
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicChange = (topic: Topic) => {
    setCurrentTopic(topic);
    setMessages([]); // Clear history for new context
    addSystemMessage(topic.contextPrompt);
    setIsSidebarOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to get icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert size={18} />;
      case 'FlaskConical': return <FlaskConical size={18} />;
      case 'Droplets': return <Droplets size={18} />;
      default: return <Map size={18} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-850 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col shadow-xl
      `}>
        <div className="p-6 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-mining-gold p-2 rounded-lg">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">APIO Bajo Cauca</h1>
              <p className="text-xs text-gray-400">Tutor Químico Rural</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Módulos de Aprendizaje</p>
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicChange(topic)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                currentTopic.id === topic.id 
                  ? 'bg-mining-gold text-white font-medium shadow-md' 
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {getIcon(topic.icon)}
              {topic.title}
            </button>
          ))}
          
          <div className="mt-8 px-4 py-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-mining-gold flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Este agente está diseñado para funcionar en contextos de baja conectividad. 
                <br/>
                <span className="text-mining-gold/80 italic">Cáceres, Antioquia.</span>
              </p>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
             onClick={() => {
               setMessages([]);
               addSystemMessage(currentTopic.contextPrompt);
             }}
             className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Reiniciar Sesión
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="font-bold text-gray-800">{currentTopic.title}</h2>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Tutor Activo
              </span>
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu pregunta o describe tu proyecto minero..."
              disabled={isLoading}
              rows={1}
              className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-mining-gold focus:border-mining-gold resize-none outline-none transition-shadow shadow-sm disabled:opacity-50 text-gray-800"
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-mining-gold hover:bg-mining-gold-dark text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-mining-gold transform active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Agente educativo basado en el contexto del Bajo Cauca. Verifica la información química crítica.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;