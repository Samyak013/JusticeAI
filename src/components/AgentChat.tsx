import React, { useState, useRef, useEffect } from "react";
import { Message, AgentId, CaseSession } from "../types";
import { AGENTS_LIST } from "../data";
import * as Icons from "lucide-react";

interface AgentChatProps {
  session: CaseSession;
  activeAgentId: AgentId;
  setActiveAgentId: (id: AgentId) => void;
  onSendMessage: (text: string, agentId: AgentId) => Promise<void>;
  loading: boolean;
  borderless?: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  session,
  activeAgentId,
  setActiveAgentId,
  onSendMessage,
  loading,
  borderless = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const activeAgent = AGENTS_LIST.find((a) => a.id === activeAgentId) || AGENTS_LIST[1];

  // Voice recording (Speech to Text)
  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Dynamically set recognition language
    if (session.language === "Hindi") {
      recognition.lang = "hi-IN";
    } else if (session.language === "Marathi") {
      recognition.lang = "mr-IN";
    } else if (session.language === "German") {
      recognition.lang = "de-DE";
    } else if (session.language === "Spanish") {
      recognition.lang = "es-ES";
    } else if (session.language === "French") {
      recognition.lang = "fr-FR";
    } else {
      recognition.lang = "en-US";
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + " " + speechToText : speechToText));
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    
    onSendMessage(inputText, activeAgentId);
    setInputText("");
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.chatHistory, loading]);

  return (
    <div id="agent-chat-container" className={`bg-white flex flex-col h-[520px] ${
      borderless ? "w-full" : "rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    }`}>
      {/* Chat header with agent selectors */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <Icons.MessageSquare className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest font-display">Consult Individual Specialist</h4>
        </div>
        
        {/* Selector row */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg max-w-full overflow-x-auto">
          {AGENTS_LIST.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                activeAgentId === agent.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="mr-1">{agent.avatar}</span>
              {agent.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Agent Sub-info */}
      <div className={`px-4 py-2 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{activeAgent.avatar}</span>
          <span className="text-[11px] font-semibold text-slate-600">
            Active: <strong className="text-slate-800">{activeAgent.name}</strong> ({activeAgent.role})
          </span>
        </div>
        <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100/60 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest font-display">
          Online
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
        {session.chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              {activeAgent.avatar}
            </div>
            <h5 className="font-bold text-xs text-slate-800 font-display uppercase tracking-widest">Start the Discussion</h5>
            <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed">
              Ask {activeAgent.name} follow-up questions about applicable regulations, specific paragraphs, or customize your demand letter draft.
            </p>
          </div>
        ) : (
          session.chatHistory.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm shadow-xs ${
                  isUser ? "bg-slate-950 text-white" : "bg-white border border-slate-250"
                }`}>
                  {isUser ? "👤" : msg.agentId ? AGENTS_LIST.find(a => a.id === msg.agentId)?.avatar : "🤖"}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                  }`}>
                    {/* Plain Text content */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className={`text-[9px] text-slate-400 font-semibold px-1 ${
                    isUser ? "text-right" : "text-left"
                  }`}>
                    {isUser ? "You" : msg.agentName || activeAgent.name} • {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-2.5 max-w-[80%] mr-auto">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-slate-150 text-sm animate-spin">
              ⌛
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-xs text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                <span>{activeAgent.name} is drafting...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="border-t border-slate-200 p-3 bg-white flex gap-2 items-center">
        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={startSpeechRecognition}
          className={`p-2.5 rounded-xl border flex-shrink-0 transition-all cursor-pointer ${
            isListening
              ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse ring-2 ring-rose-500/20"
              : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Voice Dictation (Talk to Agent)"
        >
          {isListening ? <Icons.MicOff className="w-4 h-4" /> : <Icons.Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening... Speak clearly" : `Message ${activeAgent.name}...`}
          disabled={loading || isListening}
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none focus:bg-white disabled:opacity-50 transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading || isListening}
          className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all flex-shrink-0 cursor-pointer shadow-sm"
        >
          <Icons.Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
