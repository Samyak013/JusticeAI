import React, { useState, useEffect } from "react";
import { CaseSession, AgentId, LegalAnalysis, Message } from "./types";
import { LEGAL_CATEGORIES, SAMPLE_CASES, AGENTS_LIST } from "./data";
import { ReportPanel } from "./components/ReportPanel";
import { 
  Scale, PlusCircle, Sparkles, FolderHeart, Award, 
  MapPin, Loader, Copy, Trash2, FolderOpen, Plus, 
  Archive, Heart, Globe, ExternalLink, Building, 
  PhoneCall, Sliders, PenSquare, MessageSquare, 
  Info, Volume2, Square, ChevronDown, ChevronUp, Download, Check, ShieldCheck, Languages, RotateCcw, Search, Trash,
  Mic, MicOff
} from "lucide-react";

export default function App() {
  // Navigation State
  const [outerTab, setOuterTab] = useState<"intake" | "board" | "saved">("intake");

  // Case Session States
  const [sessions, setSessions] = useState<CaseSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Form Inputs
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Pune, Maharashtra, India");
  const [category, setCategory] = useState("housing");
  const [language, setLanguage] = useState("English");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeAgentChatId, setActiveAgentChatId] = useState<AgentId>("explainer");

  // Search & Filter state for Saved Portfolio tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Voice Dictation (Web Speech API) States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  const langCodes: Record<string, string> = {
    "English": "en-US",
    "Hindi": "hi-IN",
    "Marathi": "mr-IN",
    "Spanish": "es-ES",
    "French": "fr-FR",
    "German": "de-DE"
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognition) {
        recognition.stop();
      }
      setIsListening(false);
    } else {
      setSpeechError(null);
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setSpeechError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
        return;
      }

      const currentLangCode = langCodes[language] || "en-US";
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = currentLangCode;

      const baseText = description;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone access is denied. Please enable microphone permissions in your browser address bar.");
        } else {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const recognized = finalTranscript || interimTranscript;
        if (recognized) {
          setDescription(
            baseText + (baseText && !baseText.endsWith(" ") ? " " : "") + recognized
          );
        }
      };

      setRecognition(rec);
      try {
        rec.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Load cases from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("justiceai_sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }
  }, []);

  // Save cases to localStorage when updated
  const saveSessions = (updatedSessions: CaseSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem("justiceai_sessions", JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  };

  const getActiveSession = () => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  };

  // Preset Template loader - INSTANT and 100% Working
  const loadPreset = (preset: typeof SAMPLE_CASES[0]) => {
    setDescription(preset.description);
    setLocation(preset.location);
    setCategory(preset.category);
    setLanguage(preset.language);

    if (preset.analysis) {
      // Create or locate existing session
      const existing = sessions.find((s) => s.title === preset.title);
      if (existing) {
        setActiveSessionId(existing.id);
      } else {
        const newSession: CaseSession = {
          id: `case_preset_${Date.now()}`,
          title: preset.title,
          description: preset.description,
          location: preset.location,
          category: preset.category,
          language: preset.language,
          createdAt: new Date().toISOString(),
          analysis: preset.analysis,
          chatHistory: [],
        };

        const updated = [newSession, ...sessions];
        saveSessions(updated);
        setActiveSessionId(newSession.id);
      }
      
      // Instantly switch navigation tab to the Advisory Board results!
      setOuterTab("board");
    }
  };

  // Submit Custom Legal Consultation request to full-stack backend
  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || loading) return;

    setLoading(true);
    // Switch immediately to the board view so the user sees the consensus simulation loader!
    setOuterTab("board");

    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, location, category, language }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to query JusticeAI agents.");
      }

      const { analysis }: { analysis: LegalAnalysis } = await response.json();

      // Create a new Case session
      const newSession: CaseSession = {
        id: `case_${Date.now()}`,
        title: description.substring(0, 45) + (description.length > 45 ? "..." : ""),
        description,
        location,
        category,
        language,
        createdAt: new Date().toISOString(),
        analysis,
        chatHistory: [],
      };

      const updated = [newSession, ...sessions];
      saveSessions(updated);
      setActiveSessionId(newSession.id);

      // Clean form description
      setDescription("");
    } catch (err: any) {
      // Return back to intake in case of explicit failure to allow correction
      setOuterTab("intake");
      alert(`Consultation Failed: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  // Follow-up Chat handler with active agent
  const handleSendMessage = async (text: string, agentId: AgentId) => {
    const activeSession = getActiveSession();
    if (!activeSession || chatLoading) return;

    // 1. Append user message locally
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedSession = {
      ...activeSession,
      chatHistory: [...activeSession.chatHistory, userMsg],
    };

    const updatedSessions = sessions.map((s) => (s.id === activeSession.id ? updatedSession : s));
    setSessions(updatedSessions);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedSession.chatHistory,
          agentId,
          caseContext: {
            description: activeSession.description,
            location: activeSession.location,
            category: activeSession.category,
          },
          language: activeSession.language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to receive agent reply.");
      }

      const { content } = await response.json();

      // 2. Append assistant response
      const assistantMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        role: "assistant",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentId,
        agentName: AGENTS_LIST.find((a) => a.id === agentId)?.name,
      };

      const finalSession = {
        ...updatedSession,
        chatHistory: [...updatedSession.chatHistory, assistantMsg],
      };

      const finalSessions = sessions.map((s) => (s.id === activeSession.id ? finalSession : s));
      saveSessions(finalSessions);
    } catch (err: any) {
      alert(`Chat Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  // Request high-quality TTS audio stream from backend
  const handleTtsRequest = async (text: string): Promise<string> => {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "Zephyr" }),
    });

    if (!response.ok) {
      throw new Error("TTS generation failed");
    }

    const data = await response.json();
    return data.audio; // base64 encoded mp3
  };

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    saveSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      setDescription(selected.description);
      setLocation(selected.location);
      setCategory(selected.category);
      setLanguage(selected.language);
    }
    setOuterTab("board");
  };

  const handleDownloadFullBrief = (session: CaseSession) => {
    if (!session.analysis) return;
    const a = session.analysis;
    const brief = `=====================================================
JUSTICEAI CIVIL RIGHTS & LEGAL ANALYSIS PORTFOLIO
=====================================================
CASE TITLE: ${session.title}
CATEGORY: ${session.category.toUpperCase()}
LOCATION: ${session.location}
DATE CREATED: ${new Date(session.createdAt).toLocaleString()}
LANGUAGE: ${session.language}

-----------------------------------------------------
1. USER CASE STATEMENT
-----------------------------------------------------
${session.description}

-----------------------------------------------------
2. LEGAL RESEARCH BRIEF (Statutes & Citations)
-----------------------------------------------------
${a.researcher.findings}

STATUTES CITED:
${a.researcher.statutes.map((s) => `- ${s}`).join("\n")}

SOURCES & REFERENCES:
${a.researcher.sources.map((s) => `- ${s.title}: ${s.uri}`).join("\n")}

-----------------------------------------------------
3. RIGHTS EXPLANATION & EMPATHETIC SUMMARY
-----------------------------------------------------
${a.explainer.summary}

KEY LEGAL RIGHTS:
${a.explainer.keyRights.map((r) => `- ${r}`).join("\n")}

RECOMMENDED ACTION STEPS:
${a.explainer.actionSteps.map((s) => `- ${s}`).join("\n")}

-----------------------------------------------------
4. RECOMMENDED FILING AUTHORITY & PROCEDURE
-----------------------------------------------------
RECOMMENDED VENUE: ${a.recommendation.authorityName}
REASONING: ${a.recommendation.reasoning}
CONTACT DETAILS: ${a.recommendation.contactDetails}

FILING PROCEDURE:
${a.recommendation.procedure}

-----------------------------------------------------
5. CERTIFIED DEMAND LETTER DRAFT
-----------------------------------------------------
TITLE: ${a.generator.letterTitle}

LETTER CONTENT:
${a.generator.letterBody}

DELIVERY INSTRUCTIONS:
${a.generator.instructions}

=====================================================
Document compiled by JusticeAI. SDG 16 Compliance.
=====================================================`;

    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `justiceai_brief_${session.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeSession = getActiveSession();

  // Filtered sessions for Saved tab
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.analysis?.researcher?.findings && s.analysis.researcher.findings.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategoryFilter === "all" || s.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="justiceai-app" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* 1. Header (Dynamic Logo and Lang Selector) */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-sm border-b border-slate-800 h-16 flex items-center shrink-0">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs border border-blue-500/30">
              <Scale className="w-4 h-4 text-blue-100" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Justice<span className="text-blue-400 font-extrabold">AI</span>
              </span>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase leading-none mt-0.5 hidden sm:block">
                Collaborative Legal Advisory Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">SDG 16: Peace & Justice</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] font-bold focus:outline-none cursor-pointer"
              >
                <option value="English" className="bg-slate-900">English</option>
                <option value="Hindi" className="bg-slate-900">Hindi (हिंदी)</option>
                <option value="Marathi" className="bg-slate-900">Marathi (मराठी)</option>
                <option value="Spanish" className="bg-slate-900">Spanish (Español)</option>
                <option value="French" className="bg-slate-900">French (Français)</option>
                <option value="German" className="bg-slate-900">German (Deutsch)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main content area with permanent left sidebar navigator */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Left corner Navigator Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-4 space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block px-3">
              Control Panel
            </span>

            <nav className="space-y-1">
              <button
                onClick={() => setOuterTab("intake")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  outerTab === "intake"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <span>Case Intake Form</span>
              </button>

              <button
                onClick={() => setOuterTab("board")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  outerTab === "board"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Advisory Board</span>
                {activeSession && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setOuterTab("saved")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  outerTab === "saved"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <FolderHeart className="w-4 h-4 text-rose-400" />
                <span>Saved Case Portfolio</span>
                {sessions.length > 0 && (
                  <span className="ml-auto bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                    {sessions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* SDG banner in sidebar */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/70 space-y-1.5 hidden md:block">
            <div className="flex gap-2 items-start">
              <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[10px] font-bold text-slate-200">SDG Goal 16</h5>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                  Promoting transparent reporting, rule of law, and accessible, cost-free citizen legal standing.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right workspace screen containing active view */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* VIEW A: INTAKE & PRESETS */}
          {outerTab === "intake" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Civic Banner */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
                <div className="max-w-2xl">
                  <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-display">
                    <Award className="w-4 h-4 text-blue-400" />
                    Civic Rights & Justice Empowerment Workspace
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">
                    Every citizen deserves to understand their rights and hold powerful entities accountable. 
                    <strong> JusticeAI</strong> simplifies complex legal codes, searches state statutes, 
                    identifies the correct filing venues, and instantly drafts certified demand letters.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setDescription("");
                    setLocation("Pune, Maharashtra, India");
                    setCategory("housing");
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3.5 py-2 rounded-xl font-semibold tracking-wide flex items-center gap-1.5 text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Inputs
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* INTAKE FORM (col-span-7) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <Scale className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-display">Case Consultation Intake</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Describe your issue to convene the advisory board</p>
                    </div>
                  </div>

                  <form onSubmit={handleConsultation} className="space-y-4">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Legal Category
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {LEGAL_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              category === cat.id
                                ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/10 text-blue-900 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50/70 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-[11px] font-bold tracking-tight">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        State & Country (Required for exact local statute search)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Maharashtra, India or California, USA"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Select:</span>
                        {["Pune, MH", "Mumbai, MH", "Bengaluru, KA", "California, USA", "London, UK"].map((loc) => (
                          <button
                            key={loc}
                            type="button, submit"
                            onClick={() => {
                              if (loc === "Pune, MH") setLocation("Pune, Maharashtra, India");
                              else if (loc === "Mumbai, MH") setLocation("Mumbai, Maharashtra, India");
                              else if (loc === "Bengaluru, KA") setLocation("Bengaluru, Karnataka, India");
                              else if (loc === "London, UK") setLocation("London, UK");
                              else setLocation(loc);
                            }}
                            className="text-[9px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 px-2 py-0.5 rounded-lg transition-all border border-slate-200 cursor-pointer"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Describe your Legal Situation or Dispute
                        </label>
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                            isListening
                              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-sm"
                              : "bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-2xs"
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="w-3.5 h-3.5 text-white" />
                              <span>Listening... (Click to Stop)</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-blue-600" />
                              <span>Dictate with Voice ({language})</span>
                            </>
                          )}
                        </button>
                      </div>

                      {speechError && (
                        <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-xl animate-fadeIn">
                          ⚠️ {speechError}
                        </p>
                      )}

                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={LEGAL_CATEGORIES.find((c) => c.id === category)?.placeholder || "Provide details..."}
                        required
                        className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white outline-none placeholder-slate-400 leading-normal transition-all"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading || !description.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer hover:shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Convene Advisory Board Panel</span>
                    </button>
                  </form>
                </div>

                {/* TEMPLATE QUICK LOADERS (col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 font-display">
                      <FolderOpen className="w-4 h-4 text-indigo-500" />
                      Click to Auto-Load Case Templates
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                      Click any case template below to instantly load the full multi-agent board, review legal arguments, download demand letters, and chat.
                    </p>

                    <div className="space-y-2.5">
                      {SAMPLE_CASES.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadPreset(preset)}
                          className="w-full bg-slate-50/50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 p-3 rounded-xl text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                              preset.category === "housing" ? "bg-amber-50 text-amber-800 border border-amber-100" :
                              preset.category === "labor" ? "bg-teal-50 text-teal-800 border border-teal-100" :
                              preset.category === "consumer" ? "bg-indigo-50 text-indigo-800 border border-indigo-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                            }`}>
                              {preset.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">{preset.location.split(",")[0]}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-[11px] group-hover:text-blue-600 transition-colors truncate">
                            {preset.title}
                          </h4>
                          <p className="text-slate-500 text-[10px] leading-snug mt-1 line-clamp-1">
                            {preset.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collaborative Panel Introduction */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Meet the Collaborative Legal Advisory Board
                    </h4>
                    <div className="space-y-3">
                      {AGENTS_LIST.map((agent) => (
                        <div key={agent.id} className="flex gap-2.5 items-start">
                          <span className="text-xl shrink-0">{agent.avatar}</span>
                          <div>
                            <h5 className="font-extrabold text-slate-200 text-[11px] leading-tight">{agent.name}</h5>
                            <p className="text-[9px] text-slate-400 font-semibold">{agent.role}</p>
                            <p className="text-slate-300 text-[10px] leading-normal mt-0.5">{agent.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* VIEW B: ACTIVE BOARD ANALYSIS PANEL */}
          {outerTab === "board" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Case A: Is Loading */}
              {loading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex items-center justify-center">
                      <Scale className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                      AI Active
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 text-base font-display">Simulating Joint Consensus Pipeline</h3>
                    <p className="text-slate-500 text-xs max-w-md leading-relaxed mx-auto">
                      JusticeAI is orchestrating 4 collaborative agent roles using web search grounding to analyze regional statutes, translate safeguards, and compile draft documents.
                    </p>
                  </div>

                  {/* Animated agent checklist */}
                  <div className="w-full max-w-sm space-y-2 border-t border-slate-100 pt-4 text-left">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span>Collaborative Agents Consensus</span>
                      <span className="text-blue-600">Sequencing...</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100 animate-pulse">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <span>🕵️‍♂️ Legal Researcher is scanning state databases...</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded-lg border border-transparent">
                      <Info className="w-4 h-4" />
                      <span>💡 Rights Explainer is queued to translate findings...</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded-lg border border-transparent">
                      <Building className="w-4 h-4" />
                      <span>🏛️ Authority Expert is mapping tribunal procedures...</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded-lg border border-transparent">
                      <PenSquare className="w-4 h-4" />
                      <span>✍️ Document Generator is building certified letter...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Case B: No active session */}
              {!loading && !activeSession && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6 min-h-[400px] flex flex-col justify-center items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                    🛡️
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="font-bold text-slate-800 text-base font-display">No Active Advisory Panel</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Please describe your dispute in the <strong>Case Intake Form</strong> or load one of our quick case templates to activate the Collaborative Legal Advisory Board.
                    </p>
                  </div>
                  <button
                    onClick={() => setOuterTab("intake")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Go to Case Intake
                  </button>
                </div>
              )}

              {/* Case C: Active Session analysis is loaded */}
              {!loading && activeSession && (
                <div className="space-y-5">
                  {/* Meta header bar */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="bg-blue-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">
                          Board Analysis Active
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          activeSession.category === "housing" ? "bg-amber-950/40 text-amber-300 border border-amber-900/60" :
                          activeSession.category === "labor" ? "bg-teal-950/40 text-teal-300 border border-teal-900/60" :
                          activeSession.category === "consumer" ? "bg-indigo-950/40 text-indigo-300 border border-indigo-900/60" : "bg-rose-950/40 text-rose-300 border border-rose-900/60"
                        }`}>
                          {activeSession.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{activeSession.location}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-base leading-snug font-display">
                        {activeSession.title}
                      </h3>
                    </div>

                    <div className="flex gap-2 flex-wrap shrink-0">
                      <button
                        onClick={() => handleDownloadFullBrief(activeSession)}
                        className="px-3 py-1.5 bg-blue-900/40 border border-blue-800/60 text-blue-200 text-xs font-bold hover:bg-blue-900/60 hover:text-white rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Download Complete PDF/TXT Brief"
                      >
                        <Download className="w-3.5 h-3.5" /> Full Brief
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(activeSession.description)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-750 hover:text-white rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copy original description statement"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Case
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteSession(activeSession.id);
                          setOuterTab("intake");
                        }}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 rounded-xl transition-all cursor-pointer"
                        title="Delete case record"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Report panel wrapper containing 4 agents' portfolios */}
                  {activeSession.analysis && (
                    <ReportPanel
                      analysis={activeSession.analysis}
                      onTtsRequest={handleTtsRequest}
                      session={activeSession}
                      activeAgentId={activeAgentChatId}
                      setActiveAgentId={setActiveAgentChatId}
                      onSendMessage={handleSendMessage}
                      loading={chatLoading}
                    />
                  )}
                </div>
              )}

            </div>
          )}

          {/* VIEW C: DEDICATED SAVED PORTFOLIO TAB */}
          {outerTab === "saved" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Your Saved Case Portfolios</h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Manage and review historically compiled advisory portfolios</p>
                </div>
                <button
                  onClick={() => {
                    setActiveSessionId(null);
                    setOuterTab("intake");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Convene New Panel
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                
                {/* Search query bar */}
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, original descriptions, or statutes..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Category filters */}
                <div className="md:col-span-6 flex gap-1.5 overflow-x-auto items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">Filter:</span>
                  {["all", "housing", "labor", "consumer", "civil"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategoryFilter === cat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {cat === "all" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>

              </div>

              {/* Saved Cases List */}
              <div className="space-y-4">
                {filteredSessions.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
                    <Archive className="w-12 h-12 text-slate-300 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm font-display">No Saved Portfolios Found</h4>
                      <p className="text-slate-500 text-xs">
                        {searchQuery || selectedCategoryFilter !== "all" 
                          ? "No saved cases match your current filters. Try modifying your search term."
                          : "You have not saved any legal disputes yet. Fill out the Intake Form or load a preset case to save it!"}
                      </p>
                    </div>
                    {(searchQuery || selectedCategoryFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategoryFilter("all");
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Reset Search Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const isExpanded = expandedCaseId === session.id;
                    return (
                      <div
                        key={session.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all space-y-4 relative"
                      >
                        {/* Case Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                              session.category === "housing" ? "bg-amber-50 text-amber-800 border border-amber-100" :
                              session.category === "labor" ? "bg-teal-50 text-teal-800 border border-teal-100" :
                              session.category === "consumer" ? "bg-indigo-50 text-indigo-800 border border-indigo-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                            }`}>
                              {session.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        {/* Title & Truncated / Extended Description */}
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-extrabold text-slate-900 font-display">
                            {session.title}
                          </h3>
                          
                          <div className="text-slate-600 text-xs leading-relaxed font-semibold">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-0.5">
                              Case Description:
                            </span>
                            <p className={isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}>
                              {session.description}
                            </p>
                          </div>

                          <button
                            onClick={() => setExpandedCaseId(isExpanded ? null : session.id)}
                            className="text-[10px] text-blue-600 font-extrabold hover:text-blue-700 flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" /> Hide Description
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" /> Extend Case Description
                              </>
                            )}
                          </button>
                        </div>

                        {/* Analysis Snapshot */}
                        {session.analysis && (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                            
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Key Statutes Cited:</span>
                              <div className="flex flex-wrap gap-1">
                                {session.analysis.researcher.statutes.slice(0, 2).map((st, i) => (
                                  <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200/50 rounded px-1.5 py-0.5 text-[9px] truncate max-w-full">
                                    {st}
                                  </span>
                                ))}
                                {session.analysis.researcher.statutes.length > 2 && (
                                  <span className="text-[9px] text-slate-400 font-bold">+{session.analysis.researcher.statutes.length - 2} more</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Primary Rights Explained:</span>
                              <p className="text-slate-700 text-[11px] leading-snug line-clamp-2">
                                {session.analysis.explainer.summary}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Filing Venue recommended:</span>
                              <div className="flex items-center gap-1.5 text-indigo-700">
                                <Building className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-extrabold text-[11px] truncate max-w-full">
                                  {session.analysis.recommendation.authorityName}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* Interactive Footer Action row */}
                        <div className="flex justify-between items-center pt-2 gap-2 flex-wrap">
                          <button
                            onClick={() => handleSelectSession(session.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Open Board Review
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadFullBrief(session)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Download Full Brief PDF/TXT file"
                            >
                              <Download className="w-3.5 h-3.5" /> Export Brief
                            </button>

                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all cursor-pointer"
                              title="Delete case file permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* 3. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} JusticeAI. Empowering Citizens through Transparent, Accessible Civic Data.</p>
          <div className="flex gap-4">
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> UN SDG 16 Compliant
            </span>
            <span className="text-slate-600">|</span>
            <span>Developed with Gemini 3 Series</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
